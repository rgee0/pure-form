# pure-form

[![Linked In](https://img.shields.io/badge/Linked-In-blue.svg)](https://www.linkedin.com/in/john-i-doherty) [![Twitter Follow](https://img.shields.io/twitter/follow/CambridgeMVP.svg?style=social&label=Twitter&style=plastic)](https://twitter.com/CambridgeMVP)

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

pure-form works in all modern desktop and mobile browsers from IE9+, including Cordova/PhoneGap projects.

## Usage

### HTML

Add the [dist/pure-form.min.js](dist/pure-form.min.js) and [dist/pure-form.min.css](dist/pure-form.min.css) files to your project:

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

### Get value

pure-form `.value` returns as a JSON object containing all __populated__ form fields, empty form fields are omitted.

Giving the above example `document.getElementById('example').value` would return:

```js
{
  title: "Mr",
  firstName: "John",
  surname: "Doherty"
}
```

### Set value

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

Attribute                | Description
------------------------ | -----------------------------------------------------------------------------------------------------
`src`                    | Path to the JSON Schema that defines the form
`create-url`             | Url to post the form to when the user clicks Create
`update-url`             | Url to post the form to when the user clicks Save
`readonly`               | If true, adds read only property to all form fields
`title`                  | The title to be rendered before the form
`description`            | The description before the form
`buttons`                | Comma separated list of button labels _(excludes buttons created by schema links)_
`persist`                | Partially completed forms survive refreshes _(until browser is closed)_
`disable-validation`     | Disables all form validation
`placeholder-max-length` | Max description length to be used as placeholder, values greater than are inlined
`autofocus-error`        | If set to true, sets focus to the first input containing an error after validation
`validate-on-blur`       | If set to true, validates each form field as it looses focus _(disabled .autofocusError)_
`tab-on-enter`           | If true, moves focus to the next field in the form when enter is pressed
`use-form-tag`           | If false, uses a DIV rather than a HTML FORM tag _(helps overcome iOS GO button issue)_
`enforce-max-length`     | If true, does not allow the user to enter more characters that the value of schema maxLength property

Attributes can be applied in the following ways:

```html
<!-- html literal -->
<pure-form id="contact" src="path-to-json-schema.json" persist="true" use-form-tag="false"></pure-form>
```

Or

```js
// via setAttribute
document.getElementById('contact').setAttribute('use-form-tag', 'false');
```

## JavaScript Properties

The following properties can be set via JavaScript:

Property                | Type      | Default | Description
----------------------- | --------- | ------- | -----------------------------------------------------------------------------------------------------
`.src`                  | _string_  | `""`    | Path to the JSON Schema that defines the form
`.schema`               | _object_  | `null`  | Schema object to use
`.value`                | _object_  | `{}`    | Object containing key/value pair of values
`.createUrl`            | _string_  | `""`    | Url to post the form to when the user clicks Create
`.updateUrl`            | _string_  | `""`    | Url to post the form to when the user clicks Save
`.readonly`             | _boolean_ | `false` | If true, adds readonly property to all form fields
`.title`                | _string_  | `""`    | The title to be rendered before the form
`.description`          | _string_  | `""`    | The description before the form
`.buttons`              | _string_  | `[]`    | Comma separated list of button labels _(excludes buttons created by schema links)_
`.persist`              | _boolean_ | `false` | Partially completed forms survive refreshes _(until browser is closed)_
`.disableValidation`    | _boolean_ | `false` | Disables all form validation
`.placeholderMaxLength` | _boolean_ | `75`    | Max description length to be used as placeholder, values greater than are inlined
`.autofocusError`       | _boolean_ | `false` | If set to true, sets focus to the first input containing an error after validation
`.validateOnBlur`       | _boolean_ | `false` | If set to true, validates each form field as it looses focus _(disabled .autofocusError)_
`.tabOnEnter`           | _boolean_ | `false` | If true, moves focus to the next field in the form when enter is pressed
`.useFormTag`           | _boolean_ | `false` | If false, uses a DIV rather than a HTML FORM tag _(helps overcome iOS GO button issue)_
`.enforceMaxLength`     | _boolean_ | `false` | If true, does not allow the user to enter more characters that the value of schema maxLength property

## Methods

Each pure-form element exposes the following methods:

Method                                                               | Returns   | Description
-------------------------------------------------------------------- | --------- | ------------------------------------------------------------------------------------------
[clearError(fieldName)](#clearerrorfieldname)                        |     -     | Clears an error message on a form field
[clearErrors()](#clearerrors)                                        |     -     | Clear all form error messages
[setError(fieldName, errorMessage)](#seterrorfieldname-errormessage) |     -     | Sets a custom error message on a form field by field name
[isValid(object, silent)](#isvalidobject-silent)                     | _boolean_ | Checks if the entire form is valid and updates UI _(does not update UI if silent is true)_
[reset()](#reset)                                                    |     -     | Clears all form values and errors

### clearError(fieldName)

```js
// remove error message from email field
document.getElementById('contact').clearError('email');
```

### clearErrors()

```js
// remove all error messages
document.getElementById('contact').clearErrors();
```

### setError(fieldName, errorMessage)

```js
// set a custom error message on the phone field
document.getElementById('contact').setInvalid('phone', 'Phone number is missing country code');
```

### isValid(object, silent)

```js
// Check if the entire form is valid
var formIsValid = document.getElementById('object').isValid();

if (formIsValid) {
  // do stuff
}
```

```js
// check if a value is valid against the loaded schema
// Passing true as the second parameter tells pure-form not to update the UI with any validation errors.
var isValid = document.getElementById('object').isValid({ phone: '+441223 223 223' }, true);
```

### reset()

```js
// Clear all form values and errors
document.getElementById('object').reset();
```

## Events

pure-form fires the following events _(additional information is stored event.detail property)_:

Event                               | Description
----------------------------------- | -------------------------------------------------------------------
[schema-loaded](#schema-loaded)     | Fired when `.src` url is successfully loaded
[schema-error](#schema-error)       | Fired when `.src` url fails to return a JSON Schema
[render-complete](#render-complete) | Fired when pure-form completes rendering
[button-clicked](#button-clicked)   | Fired when a pure-form button is clicked
[value-set](#value-set)             | Fired when the form value is set

### schema-loaded

Fires when the JSON schema has loaded from `.src` url and assigned to `.schema` property.

```js
document.getElementById('contact').addEventListener('schema-loaded', function(e) {
    console.log(this);            // pure form element
    console.log(e.target);        // pure form element
    console.log(e.detail.url);    // schema URL
    console.log(e.detail.status); // http status 200
    console.log(e.detail.body);   // JSON schema as a string
});
```

### schema-error

Fires when JSON schema fails to load for whatever reason.

```js
document.getElementById('contact').addEventListener('schema-error', function(e) {
    console.log(this);            // pure form element
    console.log(e.target);        // pure form element
    console.log(e.detail.url);    // schema URL
    console.log(e.detail.status); // http status 404 (500 etc)
    console.log(e.detail.body);   // empty string
});
```

### render-complete

Fires when pure-form rendering has completed.

```js
document.getElementById('contact').addEventListener('render-complete', function(e) {
    console.log(this);      // pure form element
    console.log(e.target);  // pure form element
});
```

### button-clicked

```html
<pure-form id="contact" src="path-to-json-schema.json" buttons="Delete,Disable"></pure-form>
```

```js
document.getElementById('contact').addEventListener('button-clicked', function(e) {
    console.log(this);      // pure form element
    console.log(e.target);  // pure form element
    console.log(e.detail);  // value of button clicked (Delete or Disable)
});
```

### value-set

```js
document.getElementById('contact').addEventListener('value-set', function(e) {
    console.log(this);              // pure form element
    console.log(e.target);          // pure form element
    console.log(e.detail.oldValue); // OLD value of the form before the new value was set
    console.log(e.detail.newValue); // NEW value of the form
});
```

**TODO** add more events!! (submit etc)

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

## Testing

The project includes Unit Test. To run tests, execute the following from within the pure-form folder:

```bash
npm install
npm test
```

Tests are written using [jsdom](https://github.com/tmpvar/jsdom), [nock](https://github.com/node-nock/nock) and [jasmine-node](https://github.com/mhevery/jasmine-node) and are broken into 4 files:

| Filename | Description |
| :--- | :--- |
| `pure-form-event-spec.js` | Test pure-form events |
| `pure-form-interface-spec.js` | Tests that check the correct properties and methods are exposed |
| `pure-form-method-spec.js` | Tests that execute methods and verify their functionality |
| `pure-form-rendering-spec.js` | Tests that tweak properties and verify the rendered output |

## Build

The minified [pure-form.min.js](dist/pure-form.min.js) and [pure-form.min.css](dist/pure-form.min.css) files included in this project are the latest version. To generate .min files, execute the following:

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