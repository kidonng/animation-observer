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
}, {signal: controller.signal})

controller.abort()
```

## Browser support

This module uses the [`signal`](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener#signal) option of `EventTarget.addEventListener()`, which is supported since:

- Chrome & Edge 90
- Firefox 86
- Safari 15

## See Also

- [selector-observer](https://github.com/josh/selector-observer)
