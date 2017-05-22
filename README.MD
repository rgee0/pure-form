# Pure Form

[![Linked In](https://img.shields.io/badge/Linked-In-blue.svg)](https://www.linkedin.com/in/john-i-doherty) [![Twitter Follow](https://img.shields.io/twitter/follow/CambridgeMVP.svg?style=social&label=Twitter&style=plastic)](https://twitter.com/CambridgeMVP)

## Installation

A pure JavaScript _(no dependencies)_ Web Component that creates and validates a web form using a JSON Schema.

## Usage

```html
<pure-form src="path/to/form-schema.json" />
```

## Web Components & Browser Compatibility

Although the Web Component standard includes support for HTML Imports and the Shadow DOM, these features are difficult to polyfill for older browsers such as Internet Explorer and have a negative impact on rendering performance. For these reasons I choose to use only the core concept of Web Components ```document.registerElement```. A method that can be [polyfilled](https://github.com/WebReflection/document-register-element) back to IE8.

## Reporting Bugs

If you do find a bug, please create a [jsfiddle](https://jsfiddle.net) to replicate the error before raising an issue. Attach the jsfiddle as a link to the issue so I can replicate the error and work out a solution.

## Pull Requests

If you submit a PR, please ensure you include unit tests where needed.

## License

Licensed under [MIT License](LICENSE) &copy; [John Doherty](http://www.johndoherty.info)