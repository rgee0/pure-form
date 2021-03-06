# pure-form

[![Shippable branch](https://img.shields.io/shippable/593a3f6e937b7c07003292bd/master.svg)](https://app.shippable.com/projects/593a3f6e937b7c07003292bd) [![Linked In](https://img.shields.io/badge/Linked-In-blue.svg)](https://www.linkedin.com/in/john-i-doherty) [![Twitter Follow](https://img.shields.io/twitter/follow/CambridgeMVP.svg?style=social&label=Twitter&style=plastic)](https://twitter.com/CambridgeMVP)

A pure JavaScript drop in replacement for the HTML FORM. Removes the need to manually craft/validate/UX HTML forms. Simply define your form requirements as a [JSON Schema](https://tools.ietf.org/html/draft-zyp-json-schema-03) and assign it to the new `pure-form` HTML tag. For example:

```html
<pure-form src="space-camp-application.json"></pure-form>
```

Produces:

![Cucumber HTML report](docs/img/pure-form-screenshot.png)

Try the [demo](https://codepen.io/anon/pen/brbGza). Works in all modern web/mobile browsers from IE9+ - including Cordova/PhoneGap and iconic projects.

**Features**

* Creates a schematic HTML FORM from a JSON Schema
* Automatically handles client side validation
* Provides visual validation on blur of form fields _(optional)_
* Get/set the value of the entire form using JSON
* Displays character limits (including characters remaining) when maxLength set
* Preserves partially completed form values between refreshes _(optional)_

**Table of Contents**

* [Install](#install)
* [Usage](#usage)
  * [HTML](#html)
  * [JSON Schema](#json-schema)
  * [Attributes](#attributes)
  * [Properties](#properties)
  * [Methods](#methods)
  * [Events](#events)
  * [Data Types](#data-types)
* [Contribute](#contribute)
  * [The Vision](#the-vision)
  * [Local Development](#local-development)
  * [Testing](#testing)
  * [Generate .min Files](#generate-.min-files)
  * [Reporting Bugs](#reporting-bugs)
  * [Pull Requests](#pull-requests)
* [License](#license)

## Install

Add the [dist/pure-form.min.js](dist/pure-form.min.js) and [dist/pure-form.min.css](dist/pure-form.min.css) files to your project:

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
    <pure-form id="contactForm" src="contact-form.json" validate-on-blur="true"></pure-form>
  </body>
</html>
```

### JSON Schema

Pure form uses JSON Schema (v3) to define the forms input requirements and validation. The `space-camp-application.json` referenced above:

```json
{
  "type": "object",
  "id": "space-camp-application",
  "$schema": "http://json-schema.org/draft-03/schema#",
  "title": "Space Camp Scholarship Application",
  "description": "Please provide as much detail as possible",
  "links": [
    { "rel": "self", "title": "Apply", "href": "http://localhost:8080/223423423342", "method": "PUT" }
  ],
  "additionalProperties": false,
  "properties": {
    "title": {
      "title": "Title",
      "id": "order1",
      "type": "string",
      "required": true,
      "enum": [
        "Dr",
        "Mr",
        "Mrs",
        "Ms"
      ]
    },
    "firstName": {
      "title": "First name",
      "id": "order2",
      "type": "string",
      "required": true,
      "description": "John"
    },
    "surname": {
      "title": "Surname",
      "id": "order3",
      "type": "string",
      "required": true,
      "description": "Appleseed"
    },
    "email": {
      "title": "Email",
      "id": "order4",
      "type": "string",
      "format": "email",
      "required": true,
      "description": "example@domain.com"
    },
    "phone": {
      "title": "Telephone",
      "id": "order5",
      "type": "string"
    },
    "message": {
      "title": "Experience",
      "id": "order6",
      "type": "string",
      "format": "textarea",
      "required": true,
      "maxLength": 100
    }
  }
}
```

A button is rendered for each link item, the title property is used as the button label. If a link contains a rel that starts with `describedby:`, it is assumed to be a link to another schema, clicking that button therefore simply loads that schema.

The markup created within the `pure-form` tag is just regular HTML and can be [styled accordingly](docs/STYLING.MD).

### Attributes

The following attributes can be set in HTML or via `.setAttribute(propertyName, value)`:

Attribute                | Description
------------------------ | -----------------------------------------------------------------------------------------------------
`action`                 | Specifies where to send the form-data when a form is submitted
`enctype`                | The standard form enctype attribute specifies how the form-data should be encoded
`method`                 | Specifies how to send form-data, options are **get** (send as URL variables or **post** (as HTTP post transaction)
`src`                    | Path to the JSON Schema that defines the form
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
`schema-id`              | the id of the current schema _(readonly)_

### Properties

The following properties can be set via JavaScript:

Property                                       | Type      | Default | Description
---------------------------------------------- | --------- | ----------------------------------- | -----------------------------------------------------------------------------------------------------
[action](#action)                              | _string_  | `""`                                | Specifies where to send the form-data when a form is submitted _(if empty posts to current page)_
[enctype](#enctype)                            | _string_  | `application/x-www-form-urlencoded` | The standard form enctype attribute specifies how the form-data should be encoded
[method](#method)                              | _string_  | `get`                               | Specifies how to send form-data, options are **get** (send as URL variables or **post** (as HTTP post transaction)
[src](#src)                                    | _string_  | `""`                                | Path to the JSON Schema that defines the form
[schema](#schema)                              | _object_  | `null`                              | Schema object to use
[value](#value)                                | _object_  | `{}`                                | Object containing key/value pair of values
[readonly](#readonly)                          | _boolean_ | `false`                             | If true, adds readonly property to all form fields
[title](#title)                                | _string_  | `""`                                | The title to be rendered before the form
[description](#description)                    | _string_  | `""`                                | The description before the form
[buttons](#buttons)                            | _string_  | `""`                                | Comma separated list of button labels _(excludes buttons created by schema links)_
[persist](#persist)                            | _boolean_ | `false`                             | Partially completed forms survive refreshes _(until browser is closed)_
[disableValidation](#disablevalidation)        | _boolean_ | `false`                             | Disables all form validation
[placeholderMaxLength](#placeholdermaxlength)  | _boolean_ | `75`                                | Max description length to be used as placeholder, values greater than are inlined
[autofocusError](#autofocuserror)              | _boolean_ | `false`                             | If set to true, sets focus to the first input containing an error after validation
[validateOnBlur](#validateonblur)              | _boolean_ | `false`                             | If set to true, validates each form field as it looses focus _(disabled .autofocusError)_
[tabOnEnter](#tabonenter)                      | _boolean_ | `false`                             | If true, moves focus to the next field in the form when enter is pressed
[useFormTag](#useformtag)                      | _boolean_ | `true`                              | If false, uses a DIV rather than a HTML FORM tag _(helps overcome iOS GO button issue)_
[enforceMaxLength](#enforcemaxlength)          | _boolean_ | `false`                             | If true, does not allow the user to enter more characters that the value of schema maxLength property
[schemaId](#schemaId)                          | _string_  | _empty_                             | id valid of the currently rendered schema _(readonly)_

#### action

```js
// change the form post destination url
document.getElementById('contactForm').action = 'http://www.example.com/example';
```

#### enctype

```js
// change the format data is sent to the server
document.getElementById('contactForm').enctype = 'multipart/form-data';
```

#### method

```js
// post the form data to the server
document.getElementById('contactForm').method = 'post';
```

#### src

```js
// setting the src triggers loading of the JSON Schema:
document.getElementById('contactForm').src = 'http://domain.com/schema-name.json';
```

#### schema

```js
// get the schema retrieved from the server
var jsonSchema = document.getElementById('contactForm').schema;
```

#### value

```js
// get the value of the form as a JSON object
var formValue = document.getElementById('contactForm').value;

// set the value of the form using a JSON object with keys matching fields
document.getElementById('contactForm').value = {
  title: "Mr",
  firstName: "John",
  surname: "Doherty"
};
```

#### readonly

```js
// set all form fields to readonly
document.getElementById('contactForm').readonly = true;
```

#### title

```js
// set the title rendered at the top of the form
document.getElementById('contactForm').title = 'Contact Us';
```

#### description

```js
// set the description rendered at the top of the form
document.getElementById('contactForm').description = 'Got a question? Get in touch.';
```

#### buttons

```js
// Add Ok and Cancel buttons
document.getElementById('contactForm').buttons = 'Ok, Cancel';

document.getElementById('contactForm').addEventListener('button-clicked', function(e) {
  if (e.detail === 'Ok') {
    // Ok clicked, do something
  }
});
```

#### persist

```js
// preserve form data between page reloads
document.getElementById('contactForm').persist = true;
```

#### disableValidation

```js
// disable form validation
document.getElementById('contactForm').disableValidation = true;
```

#### placeholderMaxLength

```js
// the maximum number of characters to use a input placeholder before 
// rendering the item description under the field
document.getElementById('contactForm').placeholderMaxLength = 25;
```

#### autofocusError

```js
// automatically set focus to the first error found within a form
document.getElementById('contactForm').autofocusError = true;
```

#### validateOnBlur

```js
// automatically validate each field as it looses focus
document.getElementById('contactForm').validateOnBlur = true;
```

#### tabOnEnter

```js
// move to the next field when the user presses the enter key
document.getElementById('contactForm').tabOnEnter = true;
```

#### useFormTag

```js
// do not use a <form> tag to render form elements (helps fix iOS/Safari GO button issue)
document.getElementById('contactForm').useFormTag = true;
```

#### enforceMaxLength

```js
// stop the user from entering more character than the allowed amount (default is to inform user of overuse)
document.getElementById('contactForm').enforceMaxLength = true;
```

#### schemaId

```js
// get the currently rendered schema id
var schemaId = document.getElememtById('contactForm').schemaId;
```

### Methods

Each pure-form element exposes the following methods:

Method                                                               | Description
-------------------------------------------------------------------- | ---------------------------------------------------------
[submit(optionalRel)](#submit)                                       | Submits the form to the server
[clearError(fieldName)](#clearerrorfieldname)                        | Clears error message on a form field
[clearErrors()](#clearerrors)                                        | Clear all form error messages
[setError(fieldName, errorMessage)](#seterrorfieldname-errormessage) | Sets a custom error message on a form field
[isValid(object, silent)](#isvalidobject-silent)                     | Checks if the entire form is valid and updates UI
[reset()](#reset)                                                    | Clears all form values and errors

#### submit

```js
// submit the form to the server just like a regular HTML form
document.getElementById('contactForm').submit();

// submit the form to the server using one of the schema link objects
document.getElementById('contactForm').submit('self');
```

#### clearError(fieldName)

```js
// remove error message from email field
document.getElementById('contactForm').clearError('email');
```

#### clearErrors()

```js
// remove all error messages
document.getElementById('contactForm').clearErrors();
```

#### setError(fieldName, errorMessage)

```js
// set a custom error message on the phone field
document.getElementById('contactForm').setInvalid('phone', 'Phone number is missing country code');
```

#### isValid(object, silent)

```js
var contactForm = document.getElementById('contactForm');

if (contactForm.isValid()) {
  // form is valid, do some stuff
}
```

```js
var contactForm = document.getElementById('contactForm');

// check if a value is valid against the loaded schema (pass true as second param to avoid updating the UI)
var isValidPhone = contactForm.isValid({ phone: '+441223 223 223' }, true);

if (isValidPhone) {
  // the phone number is valid according to form schema, do something
}
```

#### reset()

```js
// Clear all form values and errors
document.getElementById('contactForm').reset();
```

### Events

pure-form fires the following events _(additional information is stored event.detail property)_:

Event                                   | Description
--------------------------------------- | -------------------------------------------------------------------
[submit](#submit)                       | Fired when the form is submitted to the server
[schema-loaded](#schema-loaded)         | Fired when `.src` url is successfully loaded
[schema-error](#schema-error)           | Fired when `.src` url fails to return a JSON Schema
[render-complete](#render-complete)     | Fired when pure-form completes rendering
[button-clicked](#button-clicked)       | Fired when a pure-form button is clicked
[value-set](#value-set)                 | Fired when the form value is set
[validation-failed](#validation-failed) | Validation failed, some field items are invalid
[validation-passed](#validation-passed) | Validation passed, all field values are valid
[submit-complete](#submit-complete)     | Data posted to server and response received

#### submit

```js
var contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', function(e) {
    console.log(this);            // pure form element
    console.log(e.target);        // pure form element
    console.log(e.detail.url);    // schema URL
    console.log(e.detail.status); // http status 200
    console.log(e.detail.body);   // JSON schema as a string
});

// trigger form submit
contactForm.submit();
```

#### schema-loaded

Fires when the JSON schema has loaded from `.src` url and assigned to `.schema` property.

```js
var contactForm = document.getElementById('contactForm');

contactForm.addEventListener('schema-loaded', function(e) {
    console.log(this);            // pure form element
    console.log(e.target);        // pure form element
    console.log(e.detail.url);    // schema URL
    console.log(e.detail.status); // http status 200
    console.log(e.detail.body);   // JSON schema as a string
});
```

#### schema-error

Fires when JSON schema fails to load for whatever reason.

```js
var contactForm = document.getElementById('contactForm');

contactForm.addEventListener('schema-error', function(e) {
    console.log(this);            // pure form element
    console.log(e.target);        // pure form element
    console.log(e.detail.url);    // schema URL
    console.log(e.detail.status); // http status 404 (500 etc)
    console.log(e.detail.body);   // empty string
});
```

#### render-complete

Fires when pure-form rendering has completed.

```js
var contactForm = document.getElementById('contactForm');

contactForm.addEventListener('render-complete', function(e) {
    console.log(this);      // pure form element
    console.log(e.target);  // pure form element
});
```

#### button-clicked

```html
<pure-form id="contact" src="path-to-json-schema.json" buttons="Delete,Disable"></pure-form>
```

```js
var contactForm = document.getElementById('contactForm');

contactForm.addEventListener('button-clicked', function(e) {
    console.log(e.target);        // pure form element
    console.log(e.detail.value);  // value of button clicked (Delete or Disable)
    console.log(e.detail.link);   // associated schema link object if present
});
```

#### value-set

```js
var contactForm = document.getElementById('contactForm');

contactForm.addEventListener('value-set', function(e) {
    console.log(e.target);          // pure form element
    console.log(e.detail.oldValue); // OLD value of the form before the new value was set
    console.log(e.detail.newValue); // NEW value of the form
});
```

#### validation-failed

Fires when pure-form .isValid method returns false.

```js
var contactForm = document.getElementById('contactForm');

contactForm.addEventListener('validation-failed', function(e) {
    console.log(e.target);      // pure form element
    console.log(e.target.value) // form value
});
```

#### validation-passed

Fires when pure-form .isValid method returns true.

```js
var contactForm = document.getElementById('contactForm');

contactForm.addEventListener('validation-passed', function(e) {
    console.log(e.target);      // pure form element
    console.log(e.target.value) // form value
});
```

#### submit-complete

```js
// data submitted and response received
document.addEventListener('submit-complete', function(e) {
    console.log(e.type);            // event name
    console.log(e.target);          // actual HTML element clicked
    console.log(e.detail.url);      // requested URL
    console.log(e.detail.status);   // HTTP status code
    console.log(e.detail.body);     // HTTP response body
});
```

### Data Types

TODO: Add JSON Schema data type/format to html type documentation

## Contribute

### The Vision

My objective is to create a single script, drop in replacement for the HTML FORM tag that separates a forms requirements from the UI, UX, validation logic. The end result should be a more intuitive, user-friendly & consistent web form with a collection of predefined schemas to handle things such as user registration, online payment etc.

It's a big goal and one that I will be advancing daily, it would be great if you could join me!

Your contribution could be as simple as [suggesting a feature](https://github.com/john-doherty/pure-form/issues), [reporting a bug](https://github.com/john-doherty/pure-form/issues), adding a little more documentation or by [forking the project](https://github.com/john-doherty/pure-form#fork-destination-box) and coding a new feature/fix/unit test.

### Local Development

The project includes everything needed to continue development, including a node webserver. If you'd like to help out, run the following to get started:

```bash
git clone https://github.com/john-doherty/pure-form
cd pure-form
npm install
npm start
```

Then visit [http://localhost:8080](http://localhost:8080) in your browser.

### Testing

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

### Generate .min Files

The minified [pure-form.min.js](dist/pure-form.min.js) and [pure-form.min.css](dist/pure-form.min.css) files included in this project are the latest version. To generate .min files, execute the following:

```bash
npm run build
```

The version number is picked up from the `package.json` file.

### Reporting Bugs

If you find a bug, please create an [issue](https://github.com/john-doherty/pure-form/issues) and provide as much detail as possible - include a [jsfiddle](https://jsfiddle.net) if possible.

### Pull Requests

Feel free to submit a pull requests, but please ensure your work is covered with unit tests and your code follows the current ESLint coding style defined in the [package.json](package.json) file.

## License

Licensed under [MIT License](LICENSE) &copy; [John Doherty](http://www.johndoherty.info)