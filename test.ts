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

test('Basic', async ({page}) => {
	await page.goto(url)

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
			setTimeout(resolve, 1e3)
		})
		observer.abort()

		const div2 = document.createElement('div')
		div2.id = 'div2'
		document.body.append(div2)
	})

	const body = page.locator('body')
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	await expect(body).toHaveClass('div1')

	const style = page.locator('style')
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	expect(await style.count()).toBe(0)
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

	await new Promise((resolve) => {
		setTimeout(resolve, 1e3)
	})
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	await expect(body).not.toHaveClass('working')

	await new Promise((resolve) => {
		setTimeout(resolve, 2e3)
	})
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

	await new Promise((resolve) => {
		setTimeout(resolve, 1e3)
	})
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	await expect(body).not.toHaveClass('working')

	await page.evaluate(() => {
		document.querySelector('div')!.remove()
	})

	await new Promise((resolve) => {
		setTimeout(resolve, 1e3)
	})
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	await expect(body).toHaveClass('working')
})

test('Signal', async ({page}) => {
	await page.goto(url)

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
			setTimeout(resolve, 1e3)
		})
		controller.abort()

		const div2 = document.createElement('div')
		div2.id = 'div2'
		document.body.append(div2)
	})

	const body = page.locator('body')
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	await expect(body).toHaveClass('div1')

	const style = page.locator('style')
	// eslint-disable-next-line @typescript-eslint/no-unsafe-call
	expect(await style.count()).toBe(0)
})
