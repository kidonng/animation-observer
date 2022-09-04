import {observe} from '..'

declare global {
	// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
	interface Window {
		observe: unknown
	}
}

window.observe = observe
