import type {ParseSelector} from 'typed-query-selector/parser.js'

export type ObserveOptions = {
	event?: 'start' | 'end' | 'cancel'
	duration?: string
	signal?: AbortSignal
	name?: string
}

const namespace = 'animation-observer'
let style: HTMLStyleElement

function createStyle() {
	if (style) return

	style = document.createElement('style')
	style.append(/* css */ `
		@keyframes ${namespace} {}
	`)
	document.head.append(style)
}

export function observe<
	Selector extends string,
	// eslint-disable-next-line @typescript-eslint/naming-convention
	TElement extends Element = ParseSelector<Selector, HTMLElement>,
>(
	selector: Selector | Selector[],
	initialize: (element: TElement) => void,
	options?: ObserveOptions,
): void {
	const {
		event = 'start',
		duration = event === 'cancel' ? '9999s' : '0s',
		signal,
		name = `${namespace}-${crypto.randomUUID()}`,
	}: ObserveOptions = options ?? {}
	if (signal?.aborted) return

	const selectorString = String(selector)
	const rule = new Text(/* css */ `
		@layer ${namespace} {
			:where(${selectorString}):not(.${name}) {
				animation-name: ${namespace};
				animation-duration: ${duration};
			}
		}
		`)
	createStyle()
	style.append(rule)

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
	signal?.addEventListener('abort', () => {
		rule.remove()
	})
}
