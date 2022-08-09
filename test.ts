import {env} from 'node:process'
import {type InlineConfig, build, preview} from 'vite'
import {test, expect} from '@playwright/test'
// Only for types, not actually used
import {observe} from './index.js'

const config: InlineConfig = {
	root: 'fixture',
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
		const observer = observe('div', (element) => {
			document.body.classList.add(element.id)
		})

		const div1 = document.createElement('div')
		div1.id = 'div1'
		document.body.append(div1)

		// Give listener some time to do its thing
		// Strangely, this throws if put into fixture
		await new Promise((resolve) => {
			window.setTimeout(resolve, 1e3)
		})
		observer.abort()

		const div2 = document.createElement('div')
		div2.id = 'div2'
		document.body.append(div2)
	})

	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	await expect(body).toHaveClass('div1')

	const style = page.locator('style')
	// Only one global animation <style> should be left
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	expect(await style.evaluate((style) => style.childNodes.length)).toBe(1)
})

test('Multiple listeners', async ({page}) => {
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

	await page.waitForTimeout(1e3)

	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	await expect(page.locator('body')).toHaveClass('class1 class2')

	const style = page.locator('style')
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	expect(await style.count()).toBe(1)
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	expect(await style.evaluate((style) => style.childNodes.length)).toBe(3)
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

	await page.waitForTimeout(1e3)
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	await expect(body).not.toHaveClass('working')

	await page.waitForTimeout(2e3)
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
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

	await page.waitForTimeout(1e3)
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	await expect(body).not.toHaveClass('working')

	await page.evaluate(() => {
		document.querySelector('div')!.remove()
	})

	await page.waitForTimeout(1e3)
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
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
			window.setTimeout(resolve, 1e3)
		})
		controller.abort()

		const div2 = document.createElement('div')
		div2.id = 'div2'
		document.body.append(div2)
	})

	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	await expect(body).toHaveClass('div1')

	const style = page.locator('style')
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
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

	await page.waitForTimeout(1e3)

	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	await expect(page.locator('body')).toHaveClass('div1')
})
