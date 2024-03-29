# animation-observer

> Lightweight module to monitor DOM elements matching a CSS selector

## Install

```sh
npm install animation-observer
```

## Usage

```js
import {observe} from 'animation-observer'

observe('div', (element) => {
	console.log(element.id, 'just slid into the DOM.')
})
```

## API

```ts
declare function observe(
	selector: string | string[],
	initialize: (element: Element) => void,
	options?: {
		event?: 'start' | 'end' | 'cancel'
		duration?: string
		signal?: AbortSignal
		name?: string
	},
): AbortController
```

## Recipes

### Stop the observer

You can pass a [`AbortSignal`](https://developer.mozilla.org/docs/Web/API/AbortSignal) to the `signal` option.

<!-- prettier-ignore -->
```js
const controller = new AbortController()

observe('img', () => {
	console.log('An image just showed up!')
}, {
	signal: controller.signal,
})

controller.abort()
```

### Listen to different events

By default, the function listens to the [`animationstart`](https://developer.mozilla.org/docs/Web/API/Element/animationstart_event) event, which triggers when a matching element ["appears"](#caveats).

You can listen to a different `event` in the options. The most prominent usage is to check element ["disappears"](#caveats):

<!-- prettier-ignore -->
```js
observe('div', (element) => {
	console.log(element.id, 'left the party.')
}, {
	event: 'cancel', // `animationcancel`
})
```

Or execute a function after a `duration`:

<!-- prettier-ignore -->
```js
observe('input:focus', () => {
	alert('Please fill in your answer quickly.')
}, {
	event: 'end', // `animationend`
	duration: '10s',
})
```

`duration` has different meaning depending on `event`:

- For `start`, it does nothing
- For `end`, it is a delay
- For `cancel`, it is a timeout (default: `9999s` a.k.a "infinity")

### Caveats

- By "appearing", it means `animationstart` and `animationend` events are fired when the element meets the following conditions:
  - Element matches the selector
  - Element is not `display: none` (`visibility: hidden` is fine)
- By "disappearing", it means `animationcancel` event is fired when one of the following happens:
  - Element no longer matches the selector (may still be in the DOM)
  - Element is removed from the DOM
  - Element becomes `display: none`

### Custom name

By default, the function generates a random class name using [`crypto.randomUUID()`](https://developer.mozilla.org/docs/Web/API/Crypto/randomUUID).

You can specify a custom `name` in the options:

<!-- prettier-ignore -->
```js
observe('[href="https://www.random.org/"]', () => {
	console.log('True randomness™️')
}, {
	name: Math.random().toString(36).slice(2),
})
```

## Browser support

This module uses CSS [`@layer`](https://developer.mozilla.org/docs/Web/CSS/@layer) to avoid conflicting with existing styles, which is supported since:

- Chrome & Edge 99
- Firefox 97
- Safari 15.4

## Credits

The first prototype is inspired by [@fregante](https://github.com/refined-github/refined-github/issues/5874#issuecomment-1200341987).

Support for multiple listeners matching the same element in [v2.1.0](https://github.com/kidonng/animation-observer/releases/tag/v2.1.0) is adapted from [Refined GitHub](https://github.com/refined-github/refined-github/pull/5886/files#diff-4512860ff8f9959a9b0b03bf0fc10f6bf704930bb48148d04c6a70ff8d500629).

## See Also

- [selector-observer](https://github.com/josh/selector-observer)
