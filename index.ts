import type {ParseSelector} from 'typed-query-selector/parser.js'

export function observe<
	Selector extends string,
	// eslint-disable-next-line @typescript-eslint/naming-convention
	TElement extends Element = ParseSelector<Selector, HTMLElement>,
>(
	selector: Selector | Selector[],
	callback: (element: TElement) => void,
): AbortController {
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

	const controller = new AbortController()
	const {signal} = controller
	document.addEventListener(
		'animationstart',
		(event) => {
			if (event.animationName !== name) {
				return
			}

			callback(event.target as TElement)
		},
		{signal},
	)
	signal.addEventListener('abort', () => {
		style.remove()
	})

	return controller
}
