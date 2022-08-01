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

### Stop the observer

The function returns a [`AbortController`](https://developer.mozilla.org/docs/Web/API/AbortController), which can be used to stop the observer.

```js
const observer = observe('a', () => {
	console.log('A wild link appeared.')
})

observer.abort()
```

### Bring Your Own [`AbortSignal`](https://developer.mozilla.org/docs/Web/API/AbortSignal)

You can also pass a `signal` in the options.

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

### Custom animation name

By default, the function generates a random animation name using [`crypto.randomUUID()`](https://developer.mozilla.org/docs/Web/API/Crypto/randomUUID), which has a slightly lower [browser support](#browser-support).

You can specify a custom animation `name` in the options:

<!-- prettier-ignore -->
```js
observe('[href="https://www.random.org/"]', () => {
	console.log('True randomness™️')
}, {
	name: Math.random().toString(36).slice(2),
})
```

## Browser support

This module uses the [`signal`](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener#signal) option of `EventTarget.addEventListener()`, which is supported since:

- Chrome & Edge 90
- Firefox 86
- Safari 15

## See Also

- [selector-observer](https://github.com/josh/selector-observer)
