# Pure Form

[![Linked In](https://img.shields.io/badge/Linked-In-blue.svg)](https://www.linkedin.com/in/john-i-doherty) [![Twitter Follow](https://img.shields.io/twitter/follow/CambridgeMVP.svg?style=social&label=Twitter&style=plastic)](https://twitter.com/CambridgeMVP)

Pure form is a pure (ES5) JavaScript Web Component that creates and validates a web form using a JSON Schema.

## Usage

Pure form can be created just like a regular HTML tag:

```html
<pure-form src="schemas/contact-form.json" buttons="Cancel, Save"></pure-form>
```

Or by creating and appending the element using JavaScript:

```js
var contactForm = document.createElement('pure-form');
contactForm.src = 'schemas/contact-form.json';
document.body.appendChild(contactForm);
```

## JSON Schema

JSON Schema (v3) is used to define the forms input requirements and validation. If the `contact-form.json` above, contained the following JSON Schema (v3):

```json
{
  "type": "object",
  "id": "contact-form",
  "$schema": "http://json-schema.org/draft-03/schema#",
  "title": "Contact Us",
  "description": "Got a question? Get in touch!",
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

The Pure Form component would construct and render the following content:

```html
<pure-form src="schemas/contact-form.json" buttons="Send" title="Contact Us" description="Got a question? Get in touch!">
   <div class="pure-form-title">Contact Us</div>
   <div class="pure-form-description">Got a question? Get in touch!</div>
   <form action="" method="post" novalidate="novalidate">
      <label for="title" class="pure-form-label" data-type="string" data-required="true" data-error="This field must have a value">
         <span class="pure-form-label-text">Title</span>
         <select name="title" id="title" autocomplete="off" required="required" autofocus="true" data-invalid="true">
            <option value=""></option>
            <option value="Mr">Mr</option>
            <option value="Mrs">Mrs</option>
            <option value="Ms">Ms</option>
         </select>
      </label>
      <label for="firstName" class="pure-form-label" data-type="string" data-required="true">
        <span class="pure-form-label-text">First name</span>
        <input name="firstName" id="firstName" type="text" autocomplete="off" required="required" />
      </label>
      <label for="surname" class="pure-form-label" data-type="string" data-required="true" />
        <span class="pure-form-label-text">Surname</span>
        <input name="surname" id="surname" type="text" autocomplete="off" required="required" placeholder="Family name" />
      </label>
      <label for="dateOfBirth" class="pure-form-label" data-format="textarea" data-type="string" data-required="true">
        <span class="pure-form-label-text">Email</span>
        <textarea name="dateOfBirth" id="dateOfBirth" rows="3" autocomplete="off" required="required"></textarea>
      </label>
      <div class="pure-form-buttons">
        <input type="submit" value="Send" class="pure-form-button" />
      </div>
   </form>
</pure-form>
```

### HTML Attributes

The following HTML attributes can be set directly on the element within your page or via JavaScript using `element.setAttribute(key, value)`

| Attribute | Description |
| :--- |  :--- |
| `src`  | Path to the JSON Schema that defines the form |
| `create-url` | Url to post the form to when the user clicks Create
| `update-url` | Url to post the form to when the user clicks Save
| `readonly` | If true, adds readonly property to all form fields
| `title` | The title to be rendered before the form
| `description` | The description before the form
| `buttons` | Comma separated list of button labels
| `persist` | Partially completed forms survive refreshes _(until browser is closed)_
| `disable-validation` | Disables all form validation
| `placeholder-maxlength` | Max description length to be used as placeholder, values greater than are inlined

### JavaScript Properties

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
| `.buttons` | _string_ | `[]` | Comma separated list of button labels |
| `.persist` | _boolean_ | `false` | Partially completed forms survive refreshes _(until browser is closed)_ |
| `.disableValidation` | _boolean_ | `false` | Disables all form validation |
| `.placeholderMaxLength` | _boolean_ | `75` | Max description length to be used as placeholder, values greater than are inlined

### Methods

| Method | Returns | Description |
| :--- | :--- | :--- |
| `.clearValidationErrors()` | - | Clear all form validation error messages |
| `.setInvalid(fieldNameAsString, errorAsString)` | - | Sets a form field to invalid |
| `.setValid(fieldNameAsString)` | - | Sets a form field to valid |
| `.validateField(keyAsString, valueAsAny)` | _Boolean_ | **Checks if a key/value is valid against the schema |
| `.isValid()` | _boolean_ | **Checks if the entire form is valid |

### Events

| Event | Description |
| :--- | :--- |
| `loaded` | This event is fired when the JSON schema set via `.src` property is successfully loaded. `.schema` property exposes the newly loaded JSON schema object | |
| `loaderror` | This event is fired when the component fails to load the JSON schema from the `.src` property |


### Data Types

TODO: add schema data type/format to html type

## Web Components & Browser Compatibility

Although the Web Component standard includes support for HTML Imports and the Shadow DOM, these features are difficult to polyfill for older browsers such as Internet Explorer and have a negative impact on rendering performance. For these reasons I choose to use only the core concept of Web Components ```document.registerElement```. A method that can be [polyfilled](https://github.com/WebReflection/document-register-element) back to IE8.

## Reporting Bugs

If you find a bug, please create a [jsfiddle](https://jsfiddle.net) to replicate the error before raising an issue. Attach the jsfiddle as a link to the issue so I can replicate the error and work out a solution.

## Pull Requests

If you submit a PR, please ensure you include unit tests.

## License

Licensed under [MIT License](LICENSE) &copy; [John Doherty](http://www.johndoherty.info)