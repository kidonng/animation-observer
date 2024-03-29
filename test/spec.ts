import {env} from 'node:process'
import {type InlineConfig, build, preview} from 'vite'
import {test, expect} from '@playwright/test'
// Only for types, not actually used
import {observe} from '../index.js'

const config: InlineConfig = {
	root: 'test',
	// Prevent Vite error
	// [vite:reporter] process.stdout.clearLine is not a function
	logLevel: 'silent',
}

await build(config)
const server = await preview(config)
const url = server.resolvedUrls.local[0]

test('Basic', async ({page, browserName}) => {
	// Flaky on Safari
	if (env.CI && browserName === 'webkit') test.skip()

	await page.goto(url)
	const body = page.locator('body')

	await page.evaluate(async () => {
		observe('div', (element) => {
			document.body.classList.add(element.id)
		})

		const div = document.createElement('div')
		div.id = 'div'
		document.body.append(div)
	})

	await expect(body).toHaveClass('div')

	const style = page.locator('style')
	expect(await style.evaluate((style) => style.childNodes.length)).toBe(2)
})

test('Multiple listeners (:not)', async ({page}) => {
	await page.goto(url)

	await page.evaluate(() => {
		observe('div', () => {
			document.body.classList.add('class1')
		})
		observe('div', () => {
			document.body.classList.add('class2')
		})

		document.body.append(document.createElement('div'))
	})

	await page.waitForTimeout(1000)

	await expect(page.locator('body')).toHaveClass('class1 class2')

	const style = page.locator('style')
	expect(await style.count()).toBe(1)
	expect(await style.evaluate((style) => style.childNodes.length)).toBe(3)
})

test('Multiple selectors (:where)', async ({page}) => {
	await page.goto(url)

	await page.evaluate(async () => {
		observe(['#div1', '#div2'], (element) => {
			document.body.classList.add(element.id)
		})

		const div1 = document.createElement('div')
		div1.id = 'div1'

		const div2 = document.createElement('div')
		div2.id = 'div2'

		document.body.append(div1, div2)

		// Give listener some time to do its thing
		// Strangely, this throws if put into fixture
		await new Promise((resolve) => {
			window.setTimeout(resolve, 1000)
		})

		document.body.classList.remove('div1')
		div1.id = 'div'

		await new Promise((resolve) => {
			window.setTimeout(resolve, 1000)
		})

		div1.id = 'div1'
	})

	await expect(page.locator('body')).toHaveClass('div2')
})

test('End event', async ({page}) => {
	await page.goto(url)
	const body = page.locator('body')

	await page.evaluate(() => {
		observe(
			'div',
			() => {
				document.body.classList.add('working')
			},
			{
				event: 'end',
				duration: '2s',
			},
		)

		document.body.append(document.createElement('div'))
	})

	await page.waitForTimeout(1000)
	await expect(body).not.toHaveClass('working')

	await page.waitForTimeout(2000)
	await expect(body).toHaveClass('working')
})

test('Cancel event', async ({page}) => {
	await page.goto(url)
	const body = page.locator('body')

	await page.evaluate(() => {
		observe(
			'div',
			() => {
				document.body.classList.add('working')
			},
			{
				event: 'cancel',
			},
		)

		document.body.append(document.createElement('div'))
	})

	await page.waitForTimeout(1000)
	await expect(body).not.toHaveClass('working')

	await page.evaluate(() => {
		document.querySelector('div')!.remove()
	})

	await page.waitForTimeout(1000)
	await expect(body).toHaveClass('working')
})

test('Signal', async ({page}) => {
	await page.goto(url)
	const body = page.locator('body')

	await page.evaluate(async () => {
		const controller = new AbortController()
		observe(
			'div',
			(element) => {
				document.body.classList.add(element.id)
			},
			{signal: controller.signal},
		)

		const div1 = document.createElement('div')
		div1.id = 'div1'
		document.body.append(div1)

		await new Promise((resolve) => {
			window.setTimeout(resolve, 1000)
		})
		controller.abort()

		const div2 = document.createElement('div')
		div2.id = 'div2'
		document.body.append(div2)
	})

	await expect(body).toHaveClass('div1')

	const style = page.locator('style')
	expect(await style.evaluate((style) => style.childNodes.length)).toBe(1)
})

test('@layer', async ({page}) => {
	await page.goto(url)

	await page.evaluate(() => {
		observe('div', (element) => {
			document.body.classList.add(element.id)
		})

		const div1 = document.createElement('div')
		div1.id = 'div1'

		const div2 = document.createElement('div')
		div2.id = 'div2'
		div2.style.animationName = 'test'

		document.body.append(div1, div2)
	})

	await page.waitForTimeout(1000)

	await expect(page.locator('body')).toHaveClass('div1')
})
