# Styling Pure Form

The following JSON Schema:

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

Would produce the following HTML elements within the pure-form tag:

```html
<pure-form id="example" src="schemas/contact-form.json" buttons="Send" title="Contact Us" description="Got a question? Get in touch!">
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

As you can see, each element within the component has a dedicated css selector with a `pure-form` prefix. Each label and element also include the key of the JSON property that create it. This allows you to target specific elements of the form using css attributes, for example:

```css
#example label[for="dateOfBirth"] .pure-form-label-text { color: #880000; }
```


## Why doesn't it use the Shadow Dom?

Although the Web Component standard includes support for HTML Imports and the Shadow DOM, these features are difficult to polyfill for older browsers such as Internet Explorer and have a negative impact on rendering performance. For these reasons I choose to use only the core concept of Web Components ```document.registerElement```. A method that can be [polyfilled](https://github.com/WebReflection/document-register-element) back to IE9.

The `pure-form` component deliberately uses direct css selectors, allowing your application to override all elements of the component easily and reducing the impact of your application css affecting the component css.