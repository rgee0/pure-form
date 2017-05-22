/**
 * pure-form.js is a JSON schema driven web component that creates a form.
 *
 * @author John Doherty <@CambridgeMVP>
 * @license MIT
 */
(function (base, window, document) {

    "use strict";

    var componentName = 'pure-form';

    // Create a new instance of the base object with these additional items
    var proto = Object.create(base, {
        src: {
            get: function () {
                return this.getAttribute('src') || '';
            },
            set: function (value) {
                this.setAttribute('src', value);
            }
        },
        schema: {
            get: function () {
                return this._schema || null;
            },
            set: function (value) {
                this._schema = value;

                this.title = this._schema.title;
                this.description = this._schema.description;

                var updateInfo = arrayWhere(this._schema.links, 'rel', 'self', true);
                if (updateInfo) {
                    this.updateUrl = updateInfo.href;
                    this.buttons += updateInfo.title || 'Update';
                }

                var createInfo = arrayWhere(this._schema.links, 'rel', 'create', true);
                if (updateInfo) {
                    this.createUrl = createInfo.href;
                    this.buttons += createInfo.title || 'Save';
                }

                renderForm.call(this);
            }
        },
        value: {
            get: function () {
                return getData.call(this);
            },
            set: function (data) {
                this._value = data;
                populateForm.call(this);
            }
        },
        createUrl: {
            get: function () {
                return this.getAttribute('create-url') || '';
            },
            set: function (value) {
                this.setAttribute('create-url', value);
            }
        },
        updateUrl: {
            get: function () {
                return this.getAttribute('update-url') || '';
            },
            set: function (value) {
                this.setAttribute('update-url', value);
            }
        },
        readonly: {
            get: function () {
                return this.getAttribute('readonly') === 'true';
            },
            set: function (value) {
                if (value) {
                    this.setAttribute('readonly', value);
                }
                else {
                    this.removeAttribute('readonly');
                }
            }
        },
        title: {
            get: function () {
                return this.getAttribute('title') || '';
            },
            set: function (value) {
                this.setAttribute('title', value || '');
            }
        },
        description: {
            get: function () {
                return this.getAttribute('description') || '';
            },
            set: function (value) {
                this.setAttribute('description', value || '');
            }
        },
        buttons: {
            get: function () {
                return (this.getAttribute('buttons') || '').split(',').filter(Boolean);
            },
            set: function (value) {
                this.setAttribute('buttons', value);
            }
        },
        persist: {
            get: function () {
                return (this.getAttribute('persist') === 'true');
            },
            set: function (value) {
                this.setAttribute('persist', value === true);
            }
        },
        disableValidation: {
            get: function () {
                return (this.getAttribute('disable-validation') === 'true');
            },
            set: function (value) {
                this.setAttribute('disable-validation', value === true);
            }
        }
    });

    proto.loadSchema = function () {

        var self = this;
        var schemaUrl = this.src;

        return fetch(schemaUrl).then(function(res) {
                return res.json();
            })
            .then(function (data) {

                self.schema = data;

                // fire on schema loaded event
                self.onschemaloaded.call(self, data.title || '', data);

                // apply session stored form data if it exists
                if (self.persist && sessionStorage[self.src]) {

                    var formData = sessionStorage[self.src] || '';

                    if (formData !== '') {
                        populateForm.call(JSON.parse(formData));
                    }
                }
            })
            .catch(function (err) {
                throw new Error('Schema not found!');
            });
    };

    /**
     * Executes when the element is first created
     */
    proto.createdCallback = function () {

        var self = this;

        this.readonly = false;
    };

    proto.attachedCallback = function () {

        if (this.src) {
            this.loadSchema();
        }
    };

    /**
     * Executes when any pure-form attribute is changed
     * @access private
     * @type {Event}
     * @this {pure-form} - current instance of pure-form
     * @param {string} attrName - the name of the attribute to have changed
     * @param {string} oldVal - the old value of the attribute
     * @param {string} newVal - the new value of the attribute
     */
    proto.attributeChangedCallback = function (attrName, oldVal, newVal) {

        if (oldVal === newVal) return;

        switch (attrName) {

            case 'src': {
                this.loadSchema();
            } break;

            case 'title': {
                renderTitle.call(this);
            } break;

            case 'description': {
                renderDescription.call(this);
            } break;

            // can't add .schema or .value as they are properties not attributes

            case 'buttons': { 
                renderButtons.call(this);
            } break;
        }
    };

    /**
     * Builds the HTML form based on the value of the assigned JSON .schema object
     */
    function renderForm() {

        if (this.schema) {

            var self = this;
            var properties = this.schema.properties;
            var orderedKeys = getSortedSchemaKeys(this.schema);
            var itemIndex = 1;
            var lbl = null;

            this.form = this.querySelector('form');

            // if we've not yet created the form, create and list for submit
            if (!this.form) {

                // keep a handle to the form element
                this.form = createEl(this, 'form', { action: '', method: 'post', novalidate: 'novalidate' });

                // hook form submit event
                this.form.onsubmit = function (e) {
                    cancelEvent(e);
                    save.call(self);
                };
            }

            // erase current form
            this.form.innerHTML = '';

            // remove keys we're not interested in
            orderedKeys = orderedKeys.filter(function (key) {
                return (key !== 'links' && key.indexOf('$') === -1 && properties.hasOwnProperty(key));
            });

            // go through each property of the schema and add form elements
            for (var i = 0; i < orderedKeys.length; i++) {

                var key = orderedKeys[i];
                var item = properties[key];

                // create a form label container (acts as a row)
                lbl = createEl(null, 'label', { 'for': key, 'class':'pure-form-label' });

                if (item.format) {
                    lbl.setAttribute('data-format', item.format);
                }

                if (item.type) {
                    lbl.setAttribute('data-type', item.type);
                }

                if (item.required) {
                    lbl.setAttribute('data-required', true);
                }

                // create form field name
                createEl(lbl, 'span', {'class': 'pure-form-label-text'}, item.title || key);

                // convert schema item to html input item
                var inputEl = schemaItemToHtmlElement.call(this, key, item);

                if (inputEl) {

                    var isHidden = (inputEl.type === 'hidden');

                    // if pure-form is readonly, apply same to elements and dont enable validation
                    if (this.readonly) {
                        inputEl.setAttribute('readonly', 'true');
                    }
                    else if (!isHidden) {

                        // set focus to the first item
                        if (itemIndex === 1) {
                            inputEl.setAttribute('autofocus', 'true');
                        }

                        // validate on blur
                        inputEl.onblur = function () {
                            self.validateField(this.id, this.value);
                        };
                    }

                    if (!isHidden) {

                        // add input to form label
                        lbl.appendChild(inputEl);

                        if (item.description) {
                            // inject as text
                            createEl(lbl, 'span', { class: 'pure-form-item-description' }, item.description || '');
                        }

                        // add row to form
                        this.form.appendChild(lbl);
                    }
                    else {
                        this.form.appendChild(inputEl);
                    }
                }
                else {
                    throw new Error('Failed to convert schema item to html element (key:' + key + ')');
                }

                // keep a count of the number of items added
                itemIndex++;
            }

            // disable all child controls if the form is readonly
            if (this.readonly) {

                var inputs = Array.prototype.slice.call(this.form.querySelectorAll('input,select,textarea'));

                inputs.forEach(function (item) {
                    item.setAttribute('disabled', 'true');
                });
            }

            renderButtons.call(this);
        }
    };

    /**
     * Adds .title value to the component
     * @access Private
     * @returns {void}
     */
    function renderTitle() {

        var titleEl = this.querySelector('.pure-form-title');

        if (titleEl) {
            titleEl.innerHTML = this.title;
        }
        else {
            titleEl = createEl(null, 'div', { 'class': 'pure-form-title' }, this.title);
            this.insertBefore(titleEl, this.form);
        }
    };

    /**
     * Adds .description value to the component
     * @access Private
     * @returns {void}
     */
    function renderDescription() {

        var descEl = this.querySelector('.pure-form-description');

        if (descEl) {
            descEl.innerHTML = this.description;
        }
        else {
            descEl = createEl(null, 'div', { 'class': 'pure-form-description' }, this.description);
            this.insertBefore(descEl, this.form);
        }
    };

    /**
     * Adds a button to the form for each item in .buttons property
     * @access Private
     * @returns {void}
     */
    function renderButtons() {

        var self = this;

        // add buttons from array if we have them
        if (this.buttons.length > 0) {

            // insert button container if it does not already exist
            var buttonContainer = this.form.querySelector('.pure-form-buttons') || createEl(this.form, 'div', { 'class': 'pure-form-buttons' });

            // ensure it's empty (this could be a re-render)
            buttonContainer.innerHTML = '';

            // add a button for each item in the array
            for (var i = 0, l = this.buttons.length; i < l; i++) {

                // insert button
                var button = createEl(buttonContainer, 'input', { 'type': 'submit', 'value': this.buttons[i].trim(), 'class': 'pure-form-button' });

                // bubble click event passing button display value to external handler
                button.onclick = function (e) {
                    cancelEvent(e);
                    self.onbuttonclick.call(self, this.value);
                };
            }
        }
    };

    /**
     * Gets data from the current form based on schema keys
     * @access private
     * @returns {object} JSON containing form data matching schema
     */
     function getData() {

        var schema = (this.schema || {}).properties;
        var formData = {};

        // go through the schema and get the form values
        for (var key in schema) {

            if (key !== 'links' && key.indexOf('$') === -1 && schema.hasOwnProperty(key)) {

                // this is the schema item not the element itself
                var schemaItem = schema[key];

                if (!schema[key].readonly) {

                    var element = this.querySelector('[name="' + key + '"]'),
                        value = '';

                    if (element) {

                        switch (schemaItem.type) {

                            case 'array': {

                                if (schemaItem.items.format === 'textarea') {
                                    formData[key] = (element.value != '') ? element.value.split('\n') : [];
                                }
                                else if (schemaItem.items.format === 'uri') {
                                    formData[key] = element.data;
                                }
                                else if (Array.isArray(element.value)) {
                                    formData[key] = element.value;
                                }
                                else {
                                    formData[key] = element.value;
                                }

                            } break;

                            case 'boolean': {
                                formData[key] = (element.checked);
                            } break;

                            case 'integer': {
                                formData[key] = element.value ? parseInt(element.value) : '';
                            } break;

                            case 'number': {
                                formData[key] = element.value ? parseFloat(element.value) : '';
                            } break;

                            default: {
                                formData[key] = (element.value || '').trim();
                            } break;
                        }
                    }

                    // remove empty strings
                    if (!schemaItem.required && formData[key] === '') {
                        delete formData[key];
                    }
                }
                else {

                    // Required, read-only value will keep its existing value since the form will not allow entry.
                    formData[key] = (this.value && this.value[key]) || (schemaItem.required && schemaItem.default) || undefined;
                }
            }

        }

        return formData;
    };

    /**
     * Gets form data regardless of validation rules
     * @access private
     * @returns {object} object containing invalidated for data
     */
    function getRawData() {

        var schema = this.schema.properties;
        var formData = {};

        // go through the schema and get the form values
        for (var key in schema) {

            if (key !== 'links' && key.indexOf('$') === -1 && !schema[key].readonly && schema.hasOwnProperty(key)) {

                var item = schema[key],
                    element = this.querySelector('[name="' + key + '"]'),
                    value = '';

                if (element) {

                    switch (item.type) {

                        case 'array': {

                            if (item.items.format === 'uri' || item.items.type === 'object') {
                                formData[key] = element.data;
                            }
                            else {
                                formData[key] = element.value;
                            }

                        } break;

                        case 'boolean': {
                            formData[key] = (element.checked);
                        } break;

                        default: {
                            formData[key] = (element.value || '').trim();
                        }
                    }
                }
            }
        }

        return formData;
    };

    proto.clearValidationErrors = function () {

        // clear previous validation errors
        this.form.removeAttribute('data-error');

        Array.prototype.slice.call(this.querySelectorAll('[data-error]')).forEach(function (item) {
            item.removeAttribute('data-error');
        });
    };

    proto.setError = function (fieldName, error) {
        if (error !== '') {

            var el = this.querySelector('[name="' + fieldName + '"]');

            if (el) {
                // mark field as invalid
                el.setAttribute('data-invalid', 'true');
                el.parentNode.setAttribute('data-error', error);
                //el.focus();
            }
        }
    };

    proto.clearError = function (fieldName) {

        var el = this.querySelector('[name="' + fieldName + '"]');

        if (el) {
            el.removeAttribute('data-invalid');
            el.parentNode.removeAttribute('data-error');
        }
    };

    /**
     * Executes validation for an individual field
     * @param {string} key - id of field to validate
     * @param {object} value - value to test against schema
     */
    proto.validateField = function (key, value) {

        // create fake data object
        var dataItem = {};

        // populate key
        dataItem[key] = value;

        // execute regular form validation but passing a single property to test
        this.isValid(dataItem);
    };

    /**
     * Returns true if form data is valid, otherwise false
     * Also updates the UI with any validation errors
     */
    proto.isValid = function (data) {

        // if validation has been disabled (for example, the Form Builder doesn't want/need it)
        if (this.disableValidation) return true;

        // if a data object is not passed, get the current values
        data = data || getData.call(this);

        var self = this;
        var schema = this.schema;
        var valid = true;

        Object.keys(data).forEach(function(key) {

            // if the item has a regex patter, grab the raw string - we do this because parseInt strips zero's
            var inputEl = self.querySelector('[name="' + key + '"]');
            var value = (schema.properties[key].pattern) ? inputEl && inputEl.value || data[key] : data[key];

            var error = validateAgainstSchema(schema, key, value);

            if (error) {
                self.setError(key, error);
                valid = false;
            }
            else {
                self.clearError(key);
            }
        });

        // update session stored form data
        if (this.persist && window.sessionStorage) {
            sessionStorage[this.src] = JSON.stringify(getRawData.call(this));
        }

        return valid;
    };

    /**
     * Saves the form data back to the server
     * @access Private
     * @returns {void}
     */
    function save() {

        var self = this;
        var createUrl = this.getAttribute('create-url') || '';
        var updateUrl = this.getAttribute('update-url') || '';
        var formData = getData.call(this);

        self.clearValidationErrors();

        // exit if not valid
        if (!self.isValid(formData)) return false;

        // execute update or create request
        if (updateUrl !== '') {

            fetch(updateUrl, {
                    method: 'PUT',
                    body: formData,
                    headers: new Headers({
                        'Content-Type': 'application/json'
                    })
                })
                .then(function(res) {
                    return res.json();
                })
                .then(function (data) {

                    // get next schema from response is present
                    var next = arrayWhere((data || {}).links, 'rel', 'next', true);

                    // if event handler returns true and we have a next object, load the next step
                    if (self.onupdate.call(self, data, next) && next) {
                        self.src = next.href;
                    }
                });
        }
        else if (createUrl !== '') {

            fetch(createUrl, {
                    method: 'POST',
                    body: formData,
                    headers: new Headers({
                        'Content-Type': 'application/json'
                    })
                })
                .then(function(res) {
                    return res.json();
                })
                .then(function (data) {

                    // get next schema from response is present
                    var next = arrayWhere((data || {}).links, 'rel', 'next', true);

                    // if event handler returns true and we have a next object, load the next step
                    if (self.oncreate.call(self, data, next) && next) {
                        self.src = next.href;
                    }
                });
        }
        else {
            self.onsave.call(self, formData);
        }
    };

    /**
     * Event handler fired when a record is created (return true to continue with next step)
     * @param {object} data - json data that was sent to the server
     * @param {object} next - next hateoas link returned from creation (if present)
     */
    proto.oncreate = function (data, next) {
        return true;
    };

    /**
     * Event handler fired when a record is update (return true to continue with next step)
     * @param {object} data - json data that was sent to the server
     * @param {object} next - next hateoas link returned from update (if present)
     */
    proto.onupdate = function (data, next) {
        return true;
    };

    proto.onbuttonclick = function (label) {
        return true;
    };

    proto.onpopulatecomplete = function () {
        return true;
    };

    /**
     * Event handler fired when a schema loads
     * @param {string} schemaTitle - .title from loaded schema
     * @param {object} schema - actual loaded schema
     */
    proto.onschemaloaded = function (schemaTitle, schema) {

    };

    /**
     * Go through the data, for each key get the element and set it's value based on element type
     * @access Private
     * @param {object} data - data to bind to the form (defaults to internal data value)
     * @returns {void}
     */
    function populateForm(data) {

        data = data || this._value;

        for (var key in data) {
            if (key !== 'links' && key.indexOf('$') === -1 && data.hasOwnProperty(key)) {

                var el = this.querySelector('[name="' + key + '"]'),
                    value = (typeof data[key] != "undefined") ? data[key] : '';

                if (!el) continue;

                setElementValue(el, value);
            }
        }

        if (this.onpopulatecomplete) {
            this.onpopulatecomplete.call(this);
        }
    };

    /**
     * Converts a JSON schema property into a HTML input element
     * @access Private
     * @param {string} id - key from schema item to be used as HTML id
     * @param {object} item - individual schema property item
     * @returns {HTMLElement} - the newly created HTML element
     */
    function schemaItemToHtmlElement(id, item) {

        var el = null;
        var type = item.items && item.items.type || item.type;
        var format = (item.items && item.items.format || item.format || '').toLowerCase();

        switch (type) {

            case 'number':
            case 'integer': {

                if (Number.isInteger(item.minimum) && Number.isInteger(item.maximum)) {
                
                    el = createEl(null, 'select', { name: id, id: id });
                    createEl(el, 'option', { 'value': '' });

                    for (var i = item.minimum; i <= item.maximum; i++) {
                        createEl(el, 'option', { 'value': i }, i);
                    }
                }
                else {
                    el = createEl(null, 'input', { name: id, id: id, type: 'number', value: '' });
                }
            } break;

            case 'string': {

                if (Array.isArray(item.enum)) {

                    el = createEl(null, 'select', { name: id, id: id });
                    createEl(el, 'option', { 'value': '' });

                    item.enum.forEach(function(value) {
                        createEl(el, 'option', { 'value': value }, value);
                    });
                }
                else {
                    el = createEl(null, 'input', { name: id, id: id, type: 'text', value: '' });
                }

            } break;

            case 'date': {
                el = createEl(null, 'input', { name: id, id: id, type: 'date', value: '' });
            } break;

            default: {
                el = createEl(null, 'input', { name: id, id: id, type: 'text', value: '' });
            }
        }

        if (el) {
            //disable autocomplete for all input items
            el.setAttribute('autocomplete', 'off');

            // assign validation if present
            if (item.readonly) el.setAttribute('readonly', 'readonly');
            if (item.required) el.setAttribute('required', 'required');
            if (item.pattern) el.setAttribute('pattern', item.pattern);
            if (item.min) el.setAttribute('min', item.min);
            if (item.max) el.setAttribute('max', item.max);
            if (item.minLength) el.setAttribute('minlength', item.minLength);
            if (item.maxLength) el.setAttribute('maxlength', item.maxLength);
            if (item.minItems) el.setAttribute('min-items', item.minItems);
            if (item.maxItems) el.setAttribute('max-items', item.maxItems);
            if (item.description) el.setAttribute('placeholder', item.description || '');
        }

        return el;
    };

    /* HELPER METHODS */
    /*----------------*/

    /**
    * Creates, configures & optionally inserts DOM elements via one function call
    * @param {object} parentEl HTML element to insert into, null if no insert is required
    * @param {string} tagName of the element to create
    * @param {object} attrs key : value collection of element attributes to create (if key is not a string, value is set as expando property)
    * @param {string} text to insert into element once created
    * @param {string} html to insert into element once created
    * @returns {object} newly constructed html element
    */
    function createEl(parentEl, tagName, attrs, text, html) {

        var el = document.createElement(tagName);
        var key = '';
        var customEl = tagName.indexOf('-') > 0;

        if (attrs) {
            for (key in attrs) {
                if (key === "class") { el.className = attrs[key]; }                 // assign className
                else if (key === 'style') { el.setAttribute('style', attrs[key]); } // assign styles
                else if (key === "id") { el.id = attrs[key]; }                      // assign id
                else if (key === "name") { el.setAttribute(key, attrs[key]); }      // assign name attribute, even for customEl
                else if (customEl || (key in el)) { el[key] = attrs[key]; }         // assign object properties
                else { el.setAttribute(key, attrs[key]); }                          // assign regular attribute
            }
        }

        if (typeof text !== 'undefined') { el.appendChild(document.createTextNode(text)); }
        if (typeof html !== 'undefined') {
            el.innerHTML = '';
            stringToDOM(html, el);
        }
        if (parentEl) { parentEl.appendChild(el); }

        return el;
    }

    function stringToDOM(src, parent) {

        parent = parent || document.createDocumentFragment();

        var el = null,
            tmp = document.createElement("div");

        // inject content into none live element
        tmp.innerHTML = src;

        // remove script tags
        var scripts = tmp.getElementsByTagName('script');
        for (var i = scripts.length - 1; i >= 0; i--) {
            scripts[i].parentElement.removeChild(scripts[i]);
        }

        // append elements
        while (el = tmp.firstChild) {
            parent.appendChild(el);
        }
        return parent;
    };

    /**
    * Cancels the current event
    * @param {object} e - browser event object
    */
    function cancelEvent(e) {
        e = e || window.event;

        if (e) {
            e.returnValue = false;
            e.cancelBubble = true;
            if (typeof (e.preventDefault) === "function") { e.preventDefault(); }
            if (typeof (e.stopPropagation) === "function") { e.stopPropagation(); }
        }
    };

    function validateAgainstSchema(schema, prop, value) {

        // TODO: Add support for the following
        // exclusiveMiimum, exclusiveMaximum (number)

        var schemaItem = getPropertyByPath(schema, prop, true),
            valLen = (value + '').length;

        if (schemaItem) {

            // check required status
            if (schemaItem.required && (!value || (Array.isArray(value) && value.length <= 0))) {
                return 'This field must have a value';
            }

            if (schemaItem.minItems && (Array.isArray(value) && value.length < schemaItem.minItems)) {
                return 'Please select at least ' + schemaItem.minItems + ' item(s)';
            }

            if (schemaItem.maxItems && (Array.isArray(value) && value.length > schemaItem.maxItems)) {
                return 'Please select a maximum of ' + schemaItem.maxItems + ' item(s)';
            }

            if (value && schemaItem.pattern && !regExMatches(value.toString(), schemaItem.pattern)) {
                return 'The value is not in the expected format';
            }

            if (value && schemaItem.minimum && parseInt(value, 10) < schemaItem.minimum) {
                return 'The value must not be lower than ' + schemaItem.minimum;
            }

            if (value && schemaItem.maximum && parseInt(value, 10) > schemaItem.maximum) {
                return 'The value must not be higher than ' + schemaItem.maximum;
            }

            if (value && schemaItem.minLength && valLen < schemaItem.minLength) {
                return 'The value must have a minimum of ' + schemaItem.minLength + ' character(s)';
            }
        }

        return null;
    };

    /**
    * Gets a property of an object from a path string (auto resolves json schema paths)
    * @param {object} obj - object to inspect
    * @param {string} prop - property path e.g. 'basics.name'
    * @returns {object}
    */
    function getPropertyByPath(obj, prop, isSchema) {

        if (typeof obj === 'undefined') {
            return false;
        }

        // is this a schema object?
        isSchema = obj.$schema !== undefined || isSchema;

        // all json schema properties are prefixed with either properties or items
        if (isSchema) {

            // if the object has a properties property, search that
            if (obj.properties && prop.indexOf('.properties') <= -1) {
                prop = 'properties.' + prop;
            }
            // otherwise check if it has an items property
            else if (obj.items && prop.indexOf('.items') <= -1) {
                prop = 'items.' + prop;
            }
        }

        // check if we have any children properties
        var index = prop.indexOf('.');

        if (index > -1) {

            obj = obj[prop.substring(0, index)];
            prop = prop.substr(index + 1);

            return getPropertyByPath(obj, prop, isSchema);
        }

        return obj[prop];
    };

    /**
    * Returns JSON Schema property keys in order based on value of .id property value
    */
    function getSortedSchemaKeys(schema) {

        schema = schema.properties || schema;

        // get the keys
        var keys = Object.keys(schema);

        keys.sort(function (a, b) {

            var aId = (schema[a].id) ? parseInt(schema[a].id.replace(/[^0-9]+/gi, '') || "0") : 0,
                bId = (schema[b].id) ? parseInt(schema[b].id.replace(/[^0-9]+/gi, '') || "0") : 0;

            return (aId - bId);
        })

        return keys;
    };

    function setElementValue(el, value) {

        var tag = (el) ? el.tagName.toLowerCase() : '';
        var type = el.type || '';

        switch (tag) {

            case 'input': {

                if (type === 'checkbox') {
                    if (value) {
                        el.setAttribute('checked', (value === true));
                    }
                    else {
                        el.removeAttribute('checked');
                    }
                }
                else {
                    el.value = value;
                }

            } break;

            case 'textarea': {
                el.value = (value.join) ? value.join('\n') : value;
            } break;

            default: {
                el.value = value;
            }
        }
    };

    /**
     * Returns a new GUID
     */
    function newGuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {

            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);

            return v.toString(16);
        });
    };

    /**
     * Returns an object/array from an array where its property equals value.
     * @param {Array} src - array to search
     * @param {string} property - property to check
     * @param {object} value - value to test
     * @param {bool} firstOnly - only returns first value if true
     */
    function arrayWhere(src, property, value, firstOnly) {
        var res = [];
        src = src || [];
        for (var i=0, l=src.length; i<l; i++) {
            if (src[i][property] == value) {
                if (firstOnly) { return src[i]; }
                res.push(src[i]);
            }
        }
        return (firstOnly) ? null : res;
    };

    /**
     * Returns true if the string matches the regular expression pattern
     * @param {string|RegExp} pattern to match
     */
    function regExMatches(src, pattern) {
        return ((pattern.constructor !== RegExp) ? new RegExp(pattern, "gm") : pattern).test(src);
    };

    // register component with the dom
    document.registerElement(componentName, { prototype: proto });

})(HTMLElement.prototype, this, document);