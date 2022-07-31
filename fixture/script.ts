import {observe} from '..'

declare global {
	interface Window {
		observe: unknown
	}
}

window.observe = observe
