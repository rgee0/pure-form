/*!
 * pure-form - v@version@
 * JSON Schema driven Form written in pure JavaScript as a Web Component
 * https://github.com/john-doherty/pure-form
 * @author John Doherty <www.johndoherty.info>
 * @license MIT
 */
(function (base, window, document) {

    'use strict';

    // TODO: consider adding method to check if fieldName is currently valid!?

    // regex validation patterns
    var patterns = {
        email: /^[a-zA-Z0-9-_.]{1,}@[a-zA-Z0-9.-]{2,}[.]{1}[a-zA-Z]{2,}$/
    };

    // Create a new instance of the base object with these additional items
    var pureForm = Object.create(base, {
        action: {
            get: function () {
                return this.getAttribute('action') || '';
            },
            set: function (value) {
                this.setAttribute('action', value || '');
            }
        },
        enctype: {
            get: function () {
                return this.getAttribute('enctype') || 'application/x-www-form-urlencoded';
            },
            set: function (value) {
                this.setAttribute('enctype', value || 'application/x-www-form-urlencoded');
            }
        },
        method: {
            get: function () {
                return this.getAttribute('method') || 'get';
            },
            set: function (value) {
                this.setAttribute('method', value || 'get');
            }
        },
        src: {
            get: function () {
                return this.getAttribute('src') || '';
            },
            set: function (value) {
                this.setAttribute('src', value || '');
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

                if (value.id) {
                    this.setAttribute('schema-id', value.id);
                }
                else {
                    this.removeAttribute('schema-id');
                }

                renderForm.call(this);
            }
        },
        value: {
            get: function () {
                return getData.call(this);
            },
            set: function (data) {
                populateForm.call(this, data);
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
                return this.getAttribute('buttons') || '';
            },
            set: function (value) {

                // remove any empty values
                value = value.split(',').filter(Boolean).join(',');

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
        },
        placeholderMaxLength: {
            get: function () {
                return parseInt(this.getAttribute('placeholder-max-length') || '75', 10);
            },
            set: function (value) {
                this.setAttribute('placeholder-max-length', value);
            }
        },
        autofocusError: {
            get: function () {
                return (this.getAttribute('autofocus-error') === 'true');
            },
            set: function (value) {
                this.setAttribute('autofocus-error', value === true);
            }
        },
        validateOnBlur: {
            get: function () {
                return (this.getAttribute('validate-on-blur') === 'true');
            },
            set: function (value) {
                this.setAttribute('validate-on-blur', value === true);
                if (value) {
                    this.autofocusError = false;
                }
            }
        },
        tabOnEnter: {
            get: function () {
                return (this.getAttribute('tab-on-enter') === 'true');
            },
            set: function (value) {
                this.setAttribute('tab-on-enter', value === true);
            }
        },
        useFormTag: {
            get: function () {
                return (this.getAttribute('use-form-tag') !== 'false');
            },
            set: function (value) {
                this.setAttribute('use-form-tag', value === true);
            }
        },
        enforceMaxLength: {
            get: function () {
                return (this.getAttribute('enforce-max-length') === 'true');
            },
            set: function (value) {
                this.setAttribute('enforce-max-length', value === true);
            }
        },
        schemaId: {
            get: function () {
                return this.getAttribute('schema-id') || '';
            }
        }
    });

    /*----------------*/
    /* PUBLIC METHODS */
    /*----------------*/

    /**
     * Executes when created, fires attributeChangedCallback for each attribute set
     * @access private
     * @returns {void}
     */
    pureForm.createdCallback = function () {

        var self = this;
        var attributes = Array.prototype.slice.call(self.attributes);

        // ensure current attributes are set
        attributes.forEach(function(item) {
            self.attributeChangedCallback(item.name, null, item.value);
        });

        // when a button is clicked, check if we have a link object for it and if so, execute the request
        self.addEventListener('button-clicked', function(e) {

            var link = e.detail.link;

            if (link) {

                // if this is a link to a schema, just load it (dont need to fire events)
                if (link.rel.toLowerCase().indexOf('describedby:') === 0) {
                    this.src = link.href;
                }
                else {

                    // fire the submit event, allowing listeners to cancel the submission
                    var allowSubmit = self.dispatchEvent(new CustomEvent('submit', { bubbles: true, cancelable: true }));

                    if (allowSubmit) {

                        // otherwise submit data to endpoint
                        submitViaLink.call(this, link);
                    }
                }
            }
        });
    };

    /**
     * Executes when any pure-form attribute is changed
     * @access private
     * @type {Event}
     * @param {string} attrName - the name of the attribute to have changed
     * @param {string} oldVal - the old value of the attribute
     * @param {string} newVal - the new value of the attribute
     * @returns {void}
     */
    pureForm.attributeChangedCallback = function (attrName, oldVal, newVal) {

        if (oldVal === newVal) return;

        switch (attrName) {

            case 'src': {
                loadSchema.call(this);
            } break;

            case 'title': {
                renderTitle.call(this);
            } break;

            case 'description': {
                renderDescription.call(this);
            } break;

            case 'buttons': {
                renderButtons.call(this);
            } break;

            case 'enctype':
            case 'action':
            case 'use-form-tag':
            case 'enforce-maxlength': {

                // we dont want to wipe out the values when a property changes, so save it's value
                var value = this.value;

                // re-render the form
                renderForm.call(this);

                // reassign the value
                this.value = value;
            }

            // NOTE: .schema & .value are properties not attributes!
        }
    };

    /**
     * Clears a form fields error
     * @access public
     * @param {string} fieldName - name of the element to set valid
     * @returns {void}
     */
    pureForm.clearError = function (fieldName) {

        var el = this.querySelector('[name="' + fieldName + '"]');

        if (el) {
            el.setAttribute('data-valid', 'true');
            el.parentNode.removeAttribute('data-error');
        }
    };

    /**
     * Public method to clear all form validation error messages
     * @access public
     * @returns {void}
     */
    pureForm.clearErrors = function () {

        // clear previous validation errors
        this.form.removeAttribute('data-error');

        Array.prototype.slice.call(this.querySelectorAll('[data-error]')).forEach(function (item) {
            item.removeAttribute('data-error');
        });

        Array.prototype.slice.call(this.querySelectorAll('[data-valid]')).forEach(function (item) {
            item.removeAttribute('data-valid');
        });
    };

    /**
     * Sets a form field to invalid
     * @access public
     * @param {string} fieldName - name of the element to set error on
     * @param {string} errorMessage - error message to set on the element
     * @returns {void}
     */
    pureForm.setError = function (fieldName, errorMessage) {

        var el = this.querySelector('[name="' + fieldName + '"]');

        if (el) {
            // mark field as invalid
            el.setAttribute('data-valid', 'false');
            el.parentNode.setAttribute('data-error', errorMessage);
        }
    };

    /**
     * Validates either the passed in object or current form data against the schema
     * @access public
     * @param {object} data - key/value data object to check against schema
     * @param {bool} silent - if true does not update the UI to reflect errors
     * @returns {boolean} true if valid otherwise false
     */
    pureForm.isValid = function (data, silent) {

        // if validation has been disabled (for example, the Form Builder doesn't want/need it)
        if (this.disableValidation) return true;

        // if a data object is not passed, get the current values
        data = data || getData.call(this);

        var self = this;
        var schema = this.schema;
        var valid = true;

        Object.keys(data).forEach(function(key) {

            // if the item has a regex pattern, grab the raw string - we do this because parseInt strips zero's
            var inputEl = self.querySelector('[name="' + key + '"]');
            var schemaItem = schema.properties[key];
            var pattern = (schemaItem) ? schemaItem.pattern : null;
            var value = '';

            if (pattern) {
                value = (inputEl) ? inputEl.value : data[key];
            }
            else {
                value = data[key];
            }

            var error = validateAgainstSchema(schema, key, value);

            if (!silent) {
                if (error) {
                    self.setError(key, error);
                    valid = false;
                }
                else {
                    self.clearError(key);
                }
            }
            else if (error) {
                valid = false;
            }
        });

        // update session stored form data
        if (this.persist && window.sessionStorage) {
            window.sessionStorage[this.src] = JSON.stringify(getRawData.call(this));
        }

        if (!silent && this.autofocusError) {
            var firstErrorEl = this.querySelector('form [data-valid="false"]');
            if (firstErrorEl) {
                firstErrorEl.focus();
            }
        }

        if (!silent) {
            if (!valid) {
                this.dispatchEvent(new CustomEvent('validation-failed', { bubbles: true, cancelable: true }));
            }
            else {
                this.dispatchEvent(new CustomEvent('validation-passed', { bubbles: true, cancelable: true }));
            }
        }

        return valid;
    };

    /**
     * Clears all form values and errors
     * @returns {void}
     */
    pureForm.reset = function() {

        var formData = {};
        var schemaProperties = (this.schema || {}).properties || {};

        Object.keys(schemaProperties).filter(function(key) {
            // skip schema .links or schema properties
            return (key !== 'links' && key.indexOf('$') <= -1);
        })
        .forEach(function(key) {
            formData[key] = schemaProperties[key].default || '';
        });

        this.value = formData;
    };

    /**
     * Submits the form
     * @param {string} rel - optional rel of link object to submit to
     * @returns {void}
     */
    pureForm.submit = function(rel) {

        if (!this.disableValidation && !this.isValid()) return;

        var allowSubmit = false;

        if (rel) {

            // attempt to find the link object matching this rel
            var link = (this.schema && Array.isArray(this.schema.links)) ? arrayWhere(this.schema.links, 'rel', rel, true) : null;

            if (link) {

                // fire the submit event, allowing listeners to cancel the submission
                allowSubmit = this.dispatchEvent(new CustomEvent('submit', { bubbles: true, cancelable: true }));

                // if consumer does not cancel the event, proceed with submit
                if (allowSubmit) {
                    submitViaLink.call(this, link);
                }
            }
        }
        else if (this.form && this.form.tagName === 'FORM' && typeof this.form.submit === 'function') {

            // fire the submit event, allowing listeners to cancel the submission
            allowSubmit = this.dispatchEvent(new CustomEvent('submit', { bubbles: true, cancelable: true }));

            if (allowSubmit) {
                this.form.submit();
            }
        }
    };

    /*-----------------*/
    /* PRIVATE METHODS */
    /*-----------------*/

    /**
     * Checks if a key/value is valid against the schema
     * @access private
     * @param {string} key - id of field to validate
     * @param {object} value - value to test against schema
     * @returns {boolean} true if valid, otherwise false
     */
    function validateField(key, value) {

        // create fake data object
        var dataItem = {};

        // populate key
        dataItem[key] = value;

        // execute regular form validation but passing a single property to test
        return this.isValid(dataItem);
    }

    /**
     * Loads the JSON schema from .src property
     * @access private
     * @returns {void}
     */
    function loadSchema() {

        var self = this;
        var schemaUrl = this.src;

        http.get(schemaUrl, 'application/json', null, function(error) {
            // fire error event
            self.dispatchEvent(new CustomEvent('schema-error', { detail: error, bubbles: true, cancelable: true }));
        },
        function(data) {

            // store the schema
            self.schema = data.body;

            // fire onload event
            self.dispatchEvent(new CustomEvent('schema-loaded', { detail: data, bubbles: true, cancelable: true }));

            // apply session stored form data if it exists
            if (self.persist && window.sessionStorage && window.sessionStorage[self.src]) {

                var formData = window.sessionStorage[self.src] || '';

                if (formData !== '') {
                    populateForm.call(self, JSON.parse(formData));
                }
            }
        });
    }

    /**
     * Builds the HTML form based on the value of the assigned JSON .schema object
     * @access private
     * @returns {void}
     */
    function renderForm() {

        if (typeof this.schema === 'object') {

            var self = this;
            var properties = this.schema.properties;
            var orderedKeys = getSortedSchemaKeys(this.schema);
            var lbl = null;

            // always create a new form tag, therefore remove the old one
            if (this.form && this.form.parentElement) {
                this.form.parentElement.removeChild(this.form);
            }

            if (this.useFormTag) {

                this.form = createEl(null, 'form', {
                    enctype: this.enctype,
                    action: this.action,
                    method: this.method,
                    novalidate: 'novalidate',
                    class: 'pure-form-form'
                });

                // hook form submit event
                this.form.onsubmit = function (e) {

                    var allowSubmit = self.dispatchEvent(new CustomEvent('submit', { bubbles: true, cancelable: true }));

                    if (!allowSubmit || !self.disableValidation || !self.isValid()) {
                        e.preventDefault();
                    }
                };
            }
            else {
                this.form = createEl(null, 'div', { class: 'pure-form-form' });
            }

            // add validate on blur handler
            this.form.addEventListener('focusout', function(e) {

                var el = e.target;

                if (el.type !== 'submit' && el.type !== 'button' && self.validateOnBlur) {
                    validateField.call(self, el.id, el.value);
                }
            }, true);

            // listen for keyboard events in case tabOnEnter is later enabled
            this.form.addEventListener('keyup', function(e) {

                var el = e.target;

                if (self.tabOnEnter) {

                    // only intercept keyup for enter key on inputs
                    if (e.keyCode === 13 && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) {

                        e.preventDefault();

                        // get all form items, convert to array to make it easier to search
                        var items = Array.prototype.slice.call(self.form.querySelectorAll('.pure-form-item'));

                        // find the input that fired the keyup, grab its index and then move focus to the next input
                        items.forEach(function(item, index) {

                            if (el === item) {

                                // shift focus to the next visible item if it is present
                                if (items[index + 1]) {
                                    items[index + 1].focus();
                                }
                            }
                        });
                    }
                }

                setCharactersRemaining(el);
            });

            // go through array of keys (as string) and remove keys we're not interested in
            orderedKeys = orderedKeys.filter(function (key) {
                return (key !== 'links' && key.indexOf('$') === -1 && properties.hasOwnProperty(key));
            });

            // go through the array of ordered keys and create an element for each item
            for (var i = 0; i < orderedKeys.length; i++) {

                var key = orderedKeys[i];
                var item = properties[key];

                // create a form label container (acts as a row)
                lbl = createEl(null, 'label', { for: key, class: 'pure-form-label' });

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
                createEl(lbl, 'span', { class: 'pure-form-label-text' }, item.title || key);

                // convert schema item to html input item
                var inputEl = schemaItemToHtmlElement.call(this, key, item);

                if (inputEl) {

                    var isHidden = (inputEl.type === 'hidden');

                    // if pure-form is readonly, apply same to elements and dont enable validation
                    if (this.readonly) {
                        inputEl.setAttribute('readonly', 'true');
                        if (inputEl.tagName === 'SELECT') inputEl.setAttribute('disabled', 'true');
                    }
                    else if (!isHidden) {

                        // set focus to the first item
                        if (i === 0) {
                            inputEl.setAttribute('autofocus', 'true');
                        }

                        // insure all inputs have a dedicated class
                        inputEl.className = 'pure-form-item';
                    }

                    if (!isHidden) {

                        // add input to form label
                        lbl.appendChild(inputEl);

                        if (item.description && item.description.length > this.placeholderMaxLength) {
                            // description is too long to render as placeholder, insert below input
                            createEl(lbl, 'span', { class: 'pure-form-item-description' }, item.description || '');
                        }

                        // add max length attribute to label if present so we can use CSS to let the user know
                        setCharactersRemaining(inputEl);

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

                this.appendChild(this.form);
            }

            renderButtons.call(this);

            // fire onload event
            self.dispatchEvent(new CustomEvent('render-complete', { bubbles: true, cancelable: true }));
        }
    }

    /**
     * Adds .title value to the component
     * @access private
     * @returns {void}
     */
    function renderTitle() {

        if (this.title !== '') {
            var titleEl = createEl(null, 'div', { class: 'pure-form-title' }, this.title);
            this.insertBefore(titleEl, this.form);
        }
        else {
            removeElementBySelector(this, '.pure-form-title');
        }
    }

    /**
     * Adds .description value to the component
     * @access private
     * @returns {void}
     */
    function renderDescription() {

        if (this.description !== '') {
            var descEl = createEl(null, 'div', { class: 'pure-form-description' }, this.description);
            this.insertBefore(descEl, this.form);
        }
        else {
            removeElementBySelector(this, '.pure-form-description');
        }
    }

    /**
     * Adds a button to the form for each item in .buttons property
     * @access private
     * @returns {void}
     */
    function renderButtons() {

        var self = this;

        var schemaButtons = (this.schema && Array.isArray(this.schema.links)) ? this.schema.links : [];

        // add buttons from array if we have them
        if (this.form && (this.buttons !== '' || schemaButtons.length > 0)) {

            // convert buttons string into array for processing (removing empty items)
            var buttons = this.buttons.split(',').filter(Boolean);

            // insert button container if it does not already exist
            var buttonContainer = this.form.querySelector('.pure-form-buttons') || createEl(this.form, 'div', { 'class': 'pure-form-buttons' });

            // ensure it's empty (this could be a re-render)
            buttonContainer.innerHTML = '';

            // insert buttons set via this.buttons
            buttons.forEach(function(item) {
                // insert button
                createEl(buttonContainer, 'input', { type: 'submit', value: item.trim(), class: 'pure-form-button' });
            });

            // remove items we would not want a button for
            schemaButtons = schemaButtons.filter(function(link) {
                return link.rel !== 'instances';
            });

            // add button for each schema link
            schemaButtons.forEach(function(link) {

                // use link title if it exists, otherwise use rel
                var label = (link.title || link.rel).trim();

                // add data-rel so we can map clicks back to schema link items
                createEl(buttonContainer, 'input', { type: 'button', 'data-rel': link.rel, value: label, class: 'pure-form-button' });
            });

            // listen for button click events
            buttonContainer.onclick = function(e) {

                var el = e.target;

                if (el.tagName === 'INPUT') {

                    var eventData = {
                        value: el.value,
                        link: null
                    };

                    switch (el.type) {

                        case 'submit': {
                            self.dispatchEvent(new CustomEvent('button-clicked', { detail: { value: el.value }, bubbles: true, cancelable: true }));
                        } break;

                        case 'button': {

                            // get rel from button
                            var rel = el.getAttribute('data-rel');

                            // get the schema link item matching this button
                            eventData.link = (self.schema && Array.isArray(self.schema.links)) ? arrayWhere(self.schema.links, 'rel', rel, true) : null;

                            // fire button-clicked event
                            self.dispatchEvent(new CustomEvent('button-clicked', { detail: eventData, bubbles: true, cancelable: true }));

                        } break;
                    }
                }
            };
        }
        else {
            removeElementBySelector(this, '.pure-form-buttons');
        }
    }

    /**
     * Updated data-characters-remaining attribute of a input label (CSS adds UX tips)
     * @param {HTMLElemenet} input - HTML element to set char attributes on
     * @returns {void}
     */
    function setCharactersRemaining(input) {

        var maxLen = parseInt(input.getAttribute('maxlength') || input.getAttribute('data-maxlength') || '0', 10);
        var label = getParentByAttributeValue(input, 'tagName', 'LABEL');

        if (label && maxLen > 0) {

            var valLen = input.value.length;

            // ensure label has a copy of the value so css can render a tip
            label.setAttribute('data-max-length', maxLen);

            if (maxLen > 0) {
                input.parentElement.setAttribute('data-characters-remaining', (maxLen - valLen));
            }
            else {
                input.parentElement.removeAttribute('data-characters-remaining');
            }

            // remove error attribute
            input.removeAttribute('data-valid');
            label.removeAttribute('data-error');
        }
    }

    /**
     * Gets data from the current form based on schema keys
     * @access private
     * @returns {object} JSON containing form data matching schema
     */
    function getData() {

        var self = this;
        var schema = (this.schema || {}).properties || {};
        var formData = {};

        // go through the schema and get the form values
        Object.keys(schema).forEach(function(key) {

            // skip schema .links or schema properties
            if (key === 'links' && key.indexOf('$') > -1) return;

            // this is the schema item not the element itself
            var schemaItem = schema[key];

            if (!schema[key].readonly) {

                var element = self.querySelector('[name="' + key + '"]');

                if (element) {

                    switch (schemaItem.type) {

                        case 'array': {

                            if (schemaItem.items.format === 'textarea') {
                                formData[key] = (element.value !== '') ? element.value.split('\n') : [];
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
                            formData[key] = element.value ? parseInt(element.value, 10) : '';
                        } break;

                        case 'number': {
                            formData[key] = element.value ? parseFloat(element.value) : '';
                        } break;

                        default: {
                            formData[key] = (element.value || '').trim();

                            if (schemaItem.maxLength) {
                                formData[key] = formData[key].substr(0, Math.max(schemaItem.maxLength, 0));
                            }
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
        });

        return formData;
    }

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
    }

    /**
     * Submits the form to the server via whichever method detailed in the link object
     * @access private
     * @param {object} linkDescObject - the link object retrieved from the schema .links collection
     * @returns {void}
     */
    function submitViaLink(linkDescObject) {

        if (!linkDescObject) return;

        var self = this;
        var formData = getData.call(this);
        var url = (linkDescObject.href || document.location.href);
        var method = (linkDescObject.method || 'POST').toLowerCase();
        var contentType = (linkDescObject.enctype || 'application/json');

        self.clearErrors();

        // exit if not valid
        if (!self.isValid(formData)) return;

        http[method](url, contentType, formData, function(err) {
            // fire error event
            self.dispatchEvent(new CustomEvent('submit-complete', { detail: err, bubbles: true, cancelable: true }));
        },
        function(data) {

            // fire onload event
            self.dispatchEvent(new CustomEvent('submit-complete', { detail: data, bubbles: true, cancelable: true }));

            if (data.body && data.body.$schema) {
                // render next schema
                self.schema = data.body;
            }
        });
    }

    /**
     * Go through the data, for each key get the element and set it's value based on element type
     * @access private
     * @param {object} data - data to bind to the form (defaults to internal data value)
     * @returns {void}
     */
    function populateForm(data) {

        var self = this;
        var newData = data;
        var oldData = this.value;

        var eventData = {
            oldValue: oldData,
            newValue: newData
        };

        // fire onload event
        var allow = self.dispatchEvent(new CustomEvent('value-set', { detail: eventData, bubbles: true, cancelable: true }));

        // user did not cancel, update form
        if (allow) {

            // go through all keys in data object, if we have an element and a value, set it
            Object.keys(newData).forEach(function(key) {

                var el = self.querySelector('[name="' + key + '"]');
                var value = (typeof newData[key] !== 'undefined') ? newData[key] : '';

                if (el) {
                    setElementValue(el, value);

                    if (self.schema.properties[key].maxLength) {
                        setCharactersRemaining(el);
                    }
                }
            });
        }
    }

    /**
     * Converts a JSON schema property into a HTML input element
     * @access private
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

            default: {

                if (Array.isArray(item.enum)) {

                    el = createEl(null, 'select', { name: id, id: id });
                    createEl(el, 'option', { value: '' });

                    item.enum.forEach(function(value) {
                        createEl(el, 'option', { value: value }, value);
                    });
                }
                else {

                    // switch types for special formats or fallback to type text
                    switch (format.toLowerCase()) {

                        case 'url':
                        case 'uri': {
                            el = createEl(null, 'input', { name: id, id: id, type: 'url', value: '' });
                        } break;

                        case 'textarea': {
                            el = createEl(null, 'textarea', { name: id, id: id, value: '', rows: 3 });
                        } break;

                        case 'date': {
                            el = createEl(null, 'input', { name: id, id: id, type: 'date', value: '' });
                        } break;

                        case 'password': {
                            el = createEl(null, 'input', { name: id, id: id, type: 'password', value: '', autocomplete: 'new-password' });
                        } break;

                        case 'email': {
                            el = createEl(null, 'input', { name: id, id: id, type: 'email', pattern: patterns.email, value: '' });
                        } break;

                        default: {
                            el = createEl(null, 'input', { name: id, id: id, type: 'text', value: '' });
                        }
                    }
                }
            }
        }

        if (el) {

            if (!el.getAttribute('autocomplete')) {
                // disable autocomplete for all input items
                el.setAttribute('autocomplete', 'off');
            }

            // assign validation if present
            if (item.readonly) el.setAttribute('readonly', 'true');
            if (item.readonly && el.tagName === 'SELECT') el.setAttribute('disabled', 'true');
            if (item.required) el.setAttribute('required', 'required');
            if (item.pattern) el.setAttribute('pattern', item.pattern);
            if (item.min) el.setAttribute('min', item.min);
            if (item.max) el.setAttribute('max', item.max);
            if (item.minLength) el.setAttribute('minlength', item.minLength);
            if (item.maxLength) el.setAttribute((this.enforceMaxLength) ? 'maxlength' : 'data-maxlength', item.maxLength);
            if (item.minItems) el.setAttribute('min-items', item.minItems);
            if (item.maxItems) el.setAttribute('max-items', item.maxItems);
            if (item.description && item.description.length < this.placeholderMaxLength) {
                el.setAttribute('placeholder', item.description || '');
            }
        }

        return el;
    }

    /*------------------------*/
    /* PRIVATE HELPER METHODS */
    /*------------------------*/

    /**
    * Walks up the DOM from the current node and returns an element where the attribute matches the value.
    * @access private
    * @param {object} el - element to indicate the DOM walking starting position
    * @param {string} attName - attribute/property name
    * @param {string} attValue - value of the attribute/property to match
    * @returns {HTMLElement} or null if not found
    */
    function getParentByAttributeValue(el, attName, attValue) {

        attName = (attName === 'class') ? 'className' : attName;
        attValue = (attName === 'className') ? '(^|\\s)' + attValue + '(\\s|$)' : attValue;
        var tmp = el.parentNode;
        while (tmp !== null && tmp.tagName && tmp.tagName.toLowerCase() !== "html") {
            if (tmp[attName] === attValue || tmp.getAttribute(attName) === attValue || (attName === 'className' && tmp[attName].matches(attValue))) {
                return tmp;
            }
            tmp = tmp.parentNode;
        }
        return null;
    }

    /**
    * Creates, configures & optionally inserts DOM elements via one function call
    * @access private
    * @param {object} parentEl HTML element to insert into, null if no insert is required
    * @param {string} tagName of the element to create
    * @param {object} attrs key : value collection of element attributes to create (if key is not a string, value is set as expando property)
    * @param {string} text to insert into element once created
    * @param {string} html to insert into element once created
    * @returns {object} newly constructed html element
    */
    function createEl(parentEl, tagName, attrs, text, html) {

        var el = document.createElement(tagName);
        var customEl = tagName.indexOf('-') > 0;

        if (attrs) {

            for (var key in attrs) {
                // assign className
                if (key === 'class') {
                    el.className = attrs[key];
                }
                // assign id
                else if (key === 'id') {
                    el.id = attrs[key];
                }
                // assign name attribute, even for customEl
                else if (key === 'name') {
                    el.setAttribute(key, attrs[key]);
                }
                // assign object properties
                else if (customEl || (key in el)) {
                    el[key] = attrs[key];
                }
                // assign regular attribute
                else {
                    el.setAttribute(key, attrs[key]);
                }
            }
        }

        if (typeof text !== 'undefined') {
            el.appendChild(document.createTextNode(text));
        }

        if (typeof html !== 'undefined') {
            el.innerHTML = '';
            stringToDOM(html, el);
        }

        if (parentEl) {
            parentEl.appendChild(el);
        }

        return el;
    }

    /**
     * Converts string containing HTML into a DOM elements - whilst removing script tags
     * @access private
     * @param {string} src - string containing HTML
     * @param {HTMLElement} [parent] - optional parent to append children into
     * @returns {DocumentFragment} fragment containing newly created elements (less script tags)
     */
    function stringToDOM(src, parent) {

        parent = parent || document.createDocumentFragment();

        var el = null;
        var tmp = document.createElement('div');

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
    }

    /**
     * Validates a value against a schema item matches by key
     * @access private
     * @param {object} schema - complete form schema
     * @param {string} prop - the name of the property to validate
     * @param {any} value - the value to test
     * @returns {string} string containing error message or null
     */
    function validateAgainstSchema(schema, prop, value) {

        // TODO: Add support for the following
        // exclusiveMiimum, exclusiveMaximum (number)

        var schemaItem = getPropertyByPath(schema, prop, true);
        var valLen = (value + '').length;

        if (schemaItem) {

            if (value && schemaItem.type === 'string' && schemaItem.format === 'email' && !regExMatches(value.toString(), patterns.email)) {
                return 'Invalid email address';
            }

            if (value && schemaItem.minLength && valLen < schemaItem.minLength) {
                return 'The value must have a minimum of ' + schemaItem.minLength + ' character(s)';
            }

            if (value && schemaItem.maxLength && valLen > schemaItem.maxLength) {
                return 'Maximum ' + schemaItem.maxLength + ' character' + ((valLen > 1) ? 's' : '');
            }

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
        }

        return null;
    }

    /**
    * Recursively searches an object for a matching property name and returns it's value if found
    * @access private
    * @param {object} obj - object to inspect
    * @param {string} prop - property path e.g. 'basics.name'
    * @param {boolean} isSchema - set to true if the object is a JSON schema, otherwise false
    * @returns {object} returns property value or null
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
    }

    /**
    * Returns JSON Schema property keys in order based on value of .id property value
    * @access private
    * @param {object} schema - JSON schema object
    * @returns {array} returns a string array of schema keys ordered by .id int value
    */
    function getSortedSchemaKeys(schema) {

        schema = schema.properties || schema;

        // get the keys
        var keys = Object.keys(schema);

        keys.sort(function (a, b) {

            var aId = (schema[a].id) ? parseInt(schema[a].id.replace(/[^0-9]+/gi, '') || '0', 10) : 0;
            var bId = (schema[b].id) ? parseInt(schema[b].id.replace(/[^0-9]+/gi, '') || '0', 10) : 0;

            return (aId - bId);
        });

        return keys;
    }

    /**
     * Set the value of a HTML input/select element
     * @access private
     * @param {HTMLElement} el - html element to set value on
     * @param {any} value - value to set
     * @returns {void}
     */
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
    }

    /**
     * Returns an object/array from an array where its property equals value.
     * @access private
     * @param {Array} src - array to search
     * @param {string} property - property to check
     * @param {object} value - value to test
     * @param {bool} firstOnly - only returns first value if true
     * @returns {array|object} returns an array of matches, or single item if @firstOnly param set
     */
    function arrayWhere(src, property, value, firstOnly) {
        var res = [];
        src = src || [];
        for (var i = 0, l = src.length; i < l; i++) {
            if (src[i][property] === value) {
                if (firstOnly) {
                    return src[i];
                }
                res.push(src[i]);
            }
        }
        return (firstOnly) ? null : res;
    }

    /**
     * Removes an element from the dom by CSS selector
     * @access private
     * @param {HTMLElement} parent - html element to look within
     * @param {string} selector - CSS selector
     * @returns {void}
     */
    function removeElementBySelector(parent, selector) {

        // remove container
        var el = (parent || document).querySelector(selector);

        if (el) {
            el.parentElement.removeChild(el);
        }
    }

    /**
     * Returns true if the string matches the regular expression pattern
     * @access private
     * @param {string} src - value to compare
     * @param {string|RegExp} pattern - pattern to match
     * @returns {boolean} returns true if pattern matches src, otherwise false
     */
    function regExMatches(src, pattern) {
        return ((pattern.constructor !== RegExp) ? new RegExp(pattern, 'g') : pattern).test(src);
    }

    // patch CustomEvent to allow constructor creation (IE/Chrome) - resolved once initCustomEvent no longer exists
    if ('initCustomEvent' in document.createEvent('CustomEvent')) {

        window.CustomEvent = function(event, params) {

            params = params || { bubbles: false, cancelable: false, detail: undefined };

            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        };

        window.CustomEvent.prototype = window.Event.prototype;
    }

    /**
     * AJAX request(s) helper
     */
    var http = (function() {

        /**
         * Converts a JSON object into HTTP encoded data
         * @param {object} data - key/value object containing data
         * @returns {string} containing object flattened and concat with '&'
         */
        function encodeData(data) {
            return Object.keys(data || {}).map(function(key) {
                return encodeURI(key + '=' + data[key]);
            }).join('&');
        }

        /**
         * Converts response data to type to match response content-type header
         * @param {string} type - response content type
         * @param {string} data - response text
         * @returns {object} raw string or JSON object
         */
        function castResponseData(type, data) {

            if ((type || '').indexOf('application/json') > -1) {
                return JSON.parse(data || '{}');
            }

            return data || '';
        }

        /**
         * Executes an AJAX GET request
         * @param {string} method - HTTP method to use
         * @param {string} url - url to request
         * @param {string} contentType - the content type to send to the server
         * @param {object} data - data to sent
         * @param {function} error - method to handle an error
         * @param {function} callback - method to handle success response
         * @returns {void}
         */
        function exec(method, url, contentType, data, error, callback) {

            var xhr = ('withCredentials' in new XMLHttpRequest()) ? new XMLHttpRequest() : new XDomainRequest();

            if (xhr) {

                method = method || 'GET';
                contentType = contentType || 'application/json';

                xhr.open(method, url);
                xhr.withCredentials = true;
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                xhr.setRequestHeader('Content-Type', contentType);

                if (window.sessionStorage && sessionStorage.authToken && sessionStorage.authToken !== '') {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + sessionStorage.authToken);
                }

                xhr.onreadystatechange = function() {
                    if (xhr.readyState === 4) {

                        var responseData = castResponseData(xhr.getResponseHeader('content-type'), xhr.responseText);

                        if (xhr.status === 200 || (xhr.status === 0 && xhr.responseText !== '')) {
                            callback({
                                url: url,
                                status: 200,
                                body: responseData
                            });
                        }
                        else {
                            error({
                                url: url,
                                status: xhr.status,
                                body: responseData
                            });
                        }
                    }
                };

                if (data) {

                    switch (contentType) {

                        case 'application/x-www-form-urlencoded': {
                            data = encodeData(data);
                        } break;

                        default: {
                            data = JSON.stringify(data);
                        } break;

                    }
                }

                xhr.send(data || null);
            }
        }

        return {
            get: function(url, contentType, data, error, callback) {
                exec('GET', url, contentType, data, error, callback);
            },
            post: function(url, contentType, data, error, callback) {
                exec('POST', url, contentType, data, error, callback);
            },
            put: function(url, contentType, data, error, callback) {
                exec('PUT', url, contentType, data, error, callback);
            },
            patch: function(url, contentType, data, error, callback) {
                exec('PATCH', url, contentType, data, error, callback);
            },
            delete: function(url, contentType, data, error, callback) {
                exec('DELETE', url, contentType, data, error, callback);
            }
        };
    })();

    if (document.registerElement) {
        // register component with the dom
        document.registerElement('pure-form', { prototype: pureForm });
    }
    else {
        throw new Error('document.registerElement does not exist. Are you missing the polyfill?');
    }

})(HTMLElement.prototype, this, document);
