# pure-form

[![Linked In](https://img.shields.io/badge/Linked-In-blue.svg)](https://www.linkedin.com/in/john-i-doherty) [![Twitter Follow](https://img.shields.io/twitter/follow/CambridgeMVP.svg?style=social&label=Twitter&style=plastic)](https://twitter.com/CambridgeMVP)

## Introduction

A simple, framework free _(written in pure JavaScript)_ web component that removes the need to manually craft and validate HTML forms. Simply define your form requirements in a [JSON Schema](https://tools.ietf.org/html/draft-zyp-json-schema-03) and assign it to the new `pure-form` HTML tag:

```html
<pure-form src="path-to-json-schema.json"></pure-form>
```

Benefits:

* Creates a schematic HTML FORM from a JSON Schema
* Automatically handles client side validation
* Provides visual validation on blur of form fields _(optional)_
* Get/set the value of the entire form using JSON
* Displays character limits (including characters remaining) when maxLength set
* Preserve partially completed form values between refreshes _(optional)_

## Compatibility

pure-form works all modern browsers from IE9+, including mobile browsers and Cordova/PhoneGap projects.

## Usage

### HTML

```html
<html>
  <head>
    <!-- add document.registerElement polyfill if IE/Safari support required -->
    <script src="document-register-element.js"></script>

    <!-- add pure-form script & css -->
    <link href="pure-form.min.css" rel="stylesheet" />
    <script src="pure-form.min.js"></script>
  </head>
  <body>
    <!-- create just like a regular HTML tag (can also be created using document.createElement) -->
    <pure-form id="example" src="contact-form.json" validate-on-blur="true"></pure-form>
  </body>
</html>
```

### JSON Schema

Pure form uses JSON Schema (v3) to define the forms input requirements and validation. The following `contact-form.json` referenced above:

```json
{
  "type": "object",
  "id": "contact-form",
  "$schema": "http://json-schema.org/draft-03/schema#",
  "title": "Contact Us",
  "description": "Got a question? Get in touch!",
  "links": [
    { "rel": "create", "title": "Save", "href": "http://localhost:8080/contact", "method": "POST" }
  ],
  "properties": {
    "title": {
      "title": "Title",
      "id": "order:010",
      "type": "string",
      "required": true,
      "enum": [
        "Mr",
        "Mrs",
        "Ms"
      ]
    },
    "firstName": {
      "title": "First name",
      "id": "order:020",
      "type": "string",
      "required": true
    },
    "surname": {
      "title": "Surname",
      "id": "order:030",
      "type": "string",
      "required": true,
      "description": "Family name"
    },
    "dateOfBirth": {
      "title": "Email",
      "id": "order:040",
      "type": "string",
      "format": "textarea",
      "required": true
    }
  }
}
```

Produces the following form, including validation.

![Cucumber HTML report](docs/img/pure-form-screenshot.png)

The markup created within the `pure-form` tag is just regular HTML and can be [styled accordingly](docs/STYLING.MD).

### Get Value

pure-form `.value` returns as a JSON object containing all __populated__ form fields, empty form fields are omitted.

Giving the above example `document.getElementById('example').value` would return:

```js
{
  title: "Mr",
  firstName: "John",
  surname: "Doherty"
}
```

### Set Value

To set the value, simply assign a JSON object with keys matching the field names to the pure-form `.value` property:

```js
document.getElementById('example').value = {
  title: "Mr",
  firstName: "John",
  surname: "Doherty"
};
```

Keys that are not referenced in the original schema are ignored.

## HTML Attributes

The following HTML attributes can be set directly on the element within your page or using `element.setAttribute(key, value)`:

| Attribute | Description |
| :--- |  :--- |
| `src`  | Path to the JSON Schema that defines the form |
| `create-url` | Url to post the form to when the user clicks Create |
| `update-url` | Url to post the form to when the user clicks Save |
| `readonly` | If true, adds read only property to all form fields |
| `title` | The title to be rendered before the form |
| `description` | The description before the form |
| `buttons` | Comma separated list of button labels _(excludes buttons created by schema links)_ |
| `persist` | Partially completed forms survive refreshes _(until browser is closed)_ |
| `disable-validation` | Disables all form validation |
| `placeholder-max-length` | Max description length to be used as placeholder, values greater than are inlined |
| `autofocus-error` | If set to true, sets focus to the first input containing an error after validation |
| `validate-on-blur` | If set to true, validates each form field as it looses focus _(disabled .autofocusError)_ |
| `tab-on-enter` | If true, moves focus to the next field in the form when enter is pressed |
| `use-form-tag` | If false, uses a DIV rather than a HTML FORM tag _(helps overcome iOS GO button issue)_ |
| `enforce-max-length` | If true, does not allow the user to enter more characters that the value of schema maxLength property |

## JavaScript Properties

The following properties can be set via JavaScript:

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `.src` | _string_ | `""` | Path to the JSON Schema that defines the form |
| `.schema` | _object_ | `null` | Schema object to use |
| `.value` | _object_ | `{}` | Object containing key/value pair of values |
| `.createUrl` | _string_ | `""` | Url to post the form to when the user clicks Create |
| `.updateUrl` | _string_ | `""` | Url to post the form to when the user clicks Save |
| `.readonly` | _boolean_ | `false` | If true, adds readonly property to all form fields |
| `.title` | _string_ | `""` | The title to be rendered before the form |
| `.description` | _string_ | `""` | The description before the form |
| `.buttons` | _string_ | `[]` | Comma separated list of button labels _(excludes buttons created by schema links)_ |
| `.persist` | _boolean_ | `false` | Partially completed forms survive refreshes _(until browser is closed)_ |
| `.disableValidation` | _boolean_ | `false` | Disables all form validation |
| `.placeholderMaxLength` | _boolean_ | `75` | Max description length to be used as placeholder, values greater than are inlined |
| `.autofocusError`| _boolean_ | `false` | If set to true, sets focus to the first input containing an error after validation |
| `.validateOnBlur` | _boolean_ | `false` | If set to true, validates each form field as it looses focus _(disabled .autofocusError)_ |
| `.tabOnEnter` | _boolean_ | `false` | If true, moves focus to the next field in the form when enter is pressed |
| `.useFormTag` | _boolean_ | `false` | If false, uses a DIV rather than a HTML FORM tag _(helps overcome iOS GO button issue)_ |
| `.enforceMaxLength` | _boolean_ | `false` | If true, does not allow the user to enter more characters that the value of schema maxLength property |

## Methods

Each pure-form element exposes the following methods:

| Method | Returns | Description |
| :--- | :--- | :--- |
| `.clearValidationErrors()` | - | Clear all form validation error messages |
| `.setInvalid(fieldNameAsString, errorAsString)` | - | Sets a form field to invalid with a custom error message |
| `.setValid(fieldNameAsString)` | - | Sets a form field to valid, clearing an error message |
| `.validateField(keyAsString, valueAsAny)` | _Boolean_ | Checks if a key/value is valid against the schema |
| `.isValid(optKeyValuePairObject, optionalSilentBool)` | _boolean_ | Checks if the entire form is valid and updates UI _(does not update UI if silent is true)_|
| `.clear()` | - | Clears all form fields |

## Events

pure-form fires the following events _(additional information is stored event.detail property)_:

| Event | Description | .detail Contains |
| :--- | :--- | :--- |
| `schema-loaded` | Fired when `.src` url is successfully loaded | _schema url_ |
| `schema-errored` | Fired when `.src` url fails to return a JSON Schema | _schema url_ |
| `render-complete` | Fired when pure-form completes rendering | _null_ |
| `button-clicked` | Fired when a pure-form button is clicked | _button display value_ |
| `value-set` | Fired when the form value is set | _null_ |
| `submit-successful` | Fired when form successfully submited to the server (200 response) | _response data_ |
| `submit-failed` | Fired when form failed to successfully submit to server | _submission url_ |


## Data Types

TODO: Add JSON Schema data type/format to html type documentation

## Continued Development

This project is a work in progress, my objective is to advance the component to handle all common form tasks - ideally incorporating all major UX tips. The project includes everything needed to continue development, including a node webserver.

If you'd like to help out, run the following to get started:

```bash
git clone https://github.com/john-doherty/pure-form
cd pure-form
npm install
npm start
```

Then visit [http://localhost:8080](http://localhost:8080) in your browser.

## Unit Test

Unit tests are written using [JSDom](https://github.com/tmpvar/jsdom), [Nock](https://github.com/node-nock/nock) and [Jasmine-Node](https://github.com/mhevery/jasmine-node) and are broken into 4 sections:

| Filename | Description |
| :--- | :--- |
| `pure-form-event-spec.js` | List of tests that test pure-form events |
| `pure-form-interface-spec.js` | List of tests that check the correct properties and methods are exposed |
| `pure-form-method-spec.js` | List of tests that execute methods and verify their functionality |
| `pure-form-rendering-spec.js` | List of tests that tweak properties and verify the rendered output |

 Tests can be run by executing the following from within the pure-form folder:

```bash
npm install
npm test
```

## Build

The distribution version of pure-form lives in the __dist__ folder ([dist/pure-form.min.js](dist/pure-form.min.js) and [dist/pure-form.min.css](dist/pure-form.min.css)). To create a new version of the minified files from source, run the following command:

```bash
npm run build
```

The version number is picked up from the `package.json` file.

## Reporting Bugs

If you find a bug, please create an [issue](https://github.com/john-doherty/pure-form/issues) and provide as much detail as possible - include a [jsfiddle](https://jsfiddle.net) if possible.

## Pull Requests

Feel free to submit a pull requests, but please ensure your work is covered with unit tests and you code follows the current ESLint coding style defined in the [package.json](package.json) file.

## License

Licensed under [MIT License](LICENSE) &copy; [John Doherty](http://www.johndoherty.info)