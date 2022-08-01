import type {ParseSelector} from 'typed-query-selector/parser.js'

export function observe<
	Selector extends string,
	// eslint-disable-next-line @typescript-eslint/naming-convention
	TElement extends Element = ParseSelector<Selector, HTMLElement>,
>(
	selector: Selector | Selector[],
	initialize: (element: TElement) => void,
	options?: {signal?: AbortSignal},
): AbortController {
	const controller = new AbortController()
	if (options?.signal?.aborted) {
		controller.abort()
		return controller
	}

	const name = `animation-observer-${Math.random().toString(36).slice(2)}`

	const style = document.createElement('style')
	style.innerHTML = /* css */ `
		@keyframes ${name} {
		}

		${Array.isArray(selector) ? selector.join(',') : selector} {
			animation-name: ${name};
		}
	`
	document.head.append(style)

	const signal = options?.signal ?? controller.signal
	document.addEventListener(
		'animationstart',
		(event) => {
			if (event.animationName !== name) {
				return
			}

			initialize(event.target as TElement)
		},
		{signal},
	)
	signal.addEventListener('abort', () => {
		style.remove()
	})

	return controller
}
