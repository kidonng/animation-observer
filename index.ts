import type {ParseSelector} from 'typed-query-selector/parser.js'

export interface ObserveOptions {
	event?: 'start' | 'end' | 'cancel'
	duration?: string
	signal?: AbortSignal
	name?: string
}

const namespace = 'animation-observer'
let hasKeyframes = false

function appendStyle(style: string) {
	const element = document.createElement('style')
	element.innerHTML = style
	document.head.append(element)
	return element
}

function addKeyframes() {
	if (hasKeyframes) return
	hasKeyframes = true

	appendStyle(/* css */ `
		@keyframes ${namespace} {}
	`)
}

export function observe<
	Selector extends string,
	// eslint-disable-next-line @typescript-eslint/naming-convention
	TElement extends Element = ParseSelector<Selector, HTMLElement>,
>(
	selector: Selector | Selector[],
	initialize: (element: TElement) => void,
	options?: ObserveOptions,
): AbortController {
	const controller = new AbortController()
	if (options?.signal?.aborted) {
		controller.abort()
		return controller
	}

	const {
		event = 'start',
		duration = event === 'cancel' ? '9999s' : '0s',
		signal = controller.signal,
		name = `${namespace}-${crypto.randomUUID()}`,
	}: ObserveOptions = options ?? {}
	const selectorString = String(selector)

	addKeyframes()
	const style = appendStyle(/* css */ `
		@layer ${namespace} {
			${selectorString}:not(.${name}) {
				animation-name: ${namespace};
				animation-duration: ${duration};
			}
		}
	`)

	document.addEventListener(
		`animation${event === 'cancel' ? 'start' : event}`,
		(rootEvent) => {
			const element = rootEvent.target as TElement
			if (!element.matches(selectorString)) return

			// `animationcancel` does not bubble
			if (event === 'cancel') {
				element.addEventListener(
					'animationcancel',
					() => {
						element.classList.add(name)
						initialize(element)
					},
					{signal},
				)
			} else {
				element.classList.add(name)
				initialize(element)
			}
		},
		{signal},
	)
	signal.addEventListener('abort', () => {
		style.remove()
	})

	return controller
}
