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

This idea is brought up by [@fregante](https://github.com/refined-github/refined-github/issues/5874#issuecomment-1200341987).

## See Also

- [selector-observer](https://github.com/josh/selector-observer)
