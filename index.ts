import type {ParseSelector} from 'typed-query-selector/parser.js'

export interface ObserveOptions {
	event?: 'start' | 'end' | 'cancel'
	duration?: string
	signal?: AbortSignal
	name?: string
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
		name = `animation-observer-${crypto.randomUUID()}`,
	}: ObserveOptions = options ?? {}

	const style = document.createElement('style')
	style.innerHTML = /* css */ `
		@keyframes ${name} {
		}

		${Array.isArray(selector) ? selector.join(',') : selector} {
			animation-name: ${name};
			animation-duration: ${duration};
		}
	`
	document.head.append(style)

	document.addEventListener(
		`animation${event === 'cancel' ? 'start' : event}`,
		(rootEvent) => {
			if (rootEvent.animationName !== name) {
				return
			}

			const element = rootEvent.target as TElement
			// `animationcancel` does not bubble
			if (event === 'cancel') {
				element.addEventListener(
					'animationcancel',
					() => {
						initialize(element)
					},
					{signal},
				)
			} else {
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
