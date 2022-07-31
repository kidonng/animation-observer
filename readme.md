# animation-observer

> Lightweight module to monitor DOM elements matching a CSS selector

## Install

```sh
npm install animation-observer
```

## Usage

### `observe(selector, callback)`

Returns a [`AbortController`](https://developer.mozilla.org/docs/Web/API/AbortController).

```js
import {observe} from 'animation-observer'

observe('div', (element) => {
	element.classList.add('awesome-class')
})

const observer = observe('.ad', (element) => {
	element.remove()
})
// Stop the observer
observer.abort()
```

## Browser support

This module uses the [`signal`](https://developer.mozilla.org/docs/Web/API/EventTarget/addEventListener#signal) option of `EventTarget.addEventListener()`, which is supported since:

- Chrome & Edge 90
- Firefox 86
- Safari 15

## See Also

- [selector-observer](https://github.com/josh/selector-observer)
