# Pure Form

[![Linked In](https://img.shields.io/badge/Linked-In-blue.svg)](https://www.linkedin.com/in/john-i-doherty) [![Twitter Follow](https://img.shields.io/twitter/follow/CambridgeMVP.svg?style=social&label=Twitter&style=plastic)](https://twitter.com/CambridgeMVP)

## Installation

A pure JavaScript _(no dependencies)_ Web Component that creates and validates a web form using a JSON Schema.

## Usage

```html
<pure-form src="path/to/form-schema.json" />
```

### Properties & Attributes

| Property | Attribute | Type | Description |
| :--- | :--- | :--- | :--- |
| .src  | src | `string` | Path to the JSON Schema that defines the form |
| .schema  | - | `object` | Schema object to use |
| .value  | - | `object` | Object containing key/value pair of values |
| .createUrl  | create-url | `string` | Url to post the form to when the user clicks Create
| .updateUrl  | update-url | `string` | Url to post the form to when the user clicks Save
| .readonly  | readonly | `boolean` | If true, adds readonly property to all form fields
| .title  | title | `string` | The title to be rendered before the form
| .description  | description | `string` | The description before the form
| .buttons  | buttons | `string` | Comma separated list of button labels
| .persist  | persist | `boolean` | Partially completed forms survive refreshes _(until browser is closed)_
| .disableValidation  | disable-validation | `boolean` | Disables all form validation

### Methods

TODO: add methods

## Web Components & Browser Compatibility

Although the Web Component standard includes support for HTML Imports and the Shadow DOM, these features are difficult to polyfill for older browsers such as Internet Explorer and have a negative impact on rendering performance. For these reasons I choose to use only the core concept of Web Components ```document.registerElement```. A method that can be [polyfilled](https://github.com/WebReflection/document-register-element) back to IE8.

## Reporting Bugs

If you do find a bug, please create a [jsfiddle](https://jsfiddle.net) to replicate the error before raising an issue. Attach the jsfiddle as a link to the issue so I can replicate the error and work out a solution.

## Pull Requests

If you submit a PR, please ensure you include unit tests where needed.

## License

Licensed under [MIT License](LICENSE) &copy; [John Doherty](http://www.johndoherty.info)