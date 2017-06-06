'use strict';

var nock = require('nock');
var jsdom = require('jsdom');
var path = require('path');

var document = null;
var window = null;

var tempSchemaUrl = 'http://localhost:8080/test-schema.json';

var inlineSchema = {
    type: 'object',
    id: 'contact-form',
    $schema: 'http://json-schema.org/draft-03/schema#',
    title: 'Contact Us',
    description: 'Got a question? Get in touch!',
    additionalProperties: false,
    properties: {
        firstName: {
            title: 'First name',
            id: 'order:020',
            type: 'string',
            required: true,
            description: 'This is a really long description to test the placeholderMaxLength feature is working correctly.'
        },
        surname: {
            title: 'Surname',
            id: 'order:030',
            type: 'string',
            required: true,
            description: 'Family name'
        }
    }
};

// intercept request for schema
nock.disableNetConnect();

describe('pure-form rendering', function () {

    // create a new browser instance before each test
    beforeEach(function (done) {

        nock('http://localhost:8080')
            .get('/polyfills/document-register-element.js')
            .replyWithFile(200, path.resolve('./polyfills/document-register-element.js'))
            .get('/src/pure-form.js')
            .replyWithFile(200, path.resolve('./src/pure-form.js'))
            .get('/test-schema.json')
            .query(true)
            .replyWithFile(200, path.resolve('./tests/test-schema.json'));

        var virtualConsole = new jsdom.VirtualConsole();

        var options = {
            url: 'http://localhost:8080',
            contentType: 'text/html',
            runScripts: 'dangerously',
            resources: 'usable',
            virtualConsole: virtualConsole.sendTo(console) // redirect browser output to terminal
        };

        // load test page from disk (includes links to dependent scripts)
        jsdom.JSDOM.fromFile(path.resolve(__dirname, 'test-page.html'), options).then(function(dom) {

            // expose the window/document object to tests
            window = dom.window;
            document = window.document;

            // slight wait to allow scripts to load
            setTimeout(function() {
                expect(document).toBeDefined();
                expect(document.title).toBe('Pure Form: Test Page');
                expect(document.registerElement).toBeDefined();
                done();
            }, 250);
        });
    });

    it('should not contain children on creation', function () {

        var el = document.createElement('pure-form');

        expect(el.children.length).toEqual(0);
    });

    it('should render title when set', function () {

        var el = document.createElement('pure-form');
        var testString = 'Hello World';
        el.title = testString;

        expect(el.querySelector('.pure-form-title')).toBeDefined();
        expect(el.querySelectorAll('.pure-form-title').length).toEqual(1);
        expect(el.querySelector('.pure-form-title').textContent).toEqual(testString);
    });

    it('should remove title when cleared', function () {

        var el = document.createElement('pure-form');
        var testString = 'Hello World';
        el.title = testString;

        expect(el.querySelector('.pure-form-title')).toBeDefined();
        expect(el.querySelector('.pure-form-title').textContent).toEqual(testString);

        el.title = '';
        expect(el.querySelector('.pure-form-title')).toBe(null);
    });

    it('should render description when set', function () {

        var el = document.createElement('pure-form');
        var testString = 'A quick form description';
        el.description = testString;

        expect(el.querySelector('pure-form-description')).toBeDefined();
        expect(el.querySelectorAll('.pure-form-description').length).toEqual(1);
        expect(el.querySelector('.pure-form-description').textContent).toEqual(testString);
    });

    it('should remove description when cleared', function () {

        var el = document.createElement('pure-form');
        var testString = 'Hello World';
        el.description = testString;

        expect(el.querySelector('.pure-form-description')).toBeDefined();
        expect(el.querySelector('.pure-form-description').textContent).toEqual(testString);

        el.description = '';
        expect(el.querySelector('.pure-form-description')).toBe(null);
    });

    it('should render buttons when set', function () {

        var buttonValues = ['One', 'Two', 'Three'];
        var el = document.createElement('pure-form');

        el.schema = inlineSchema;

        // convert to CSV string before setting
        el.buttons = buttonValues.join(',');

        // check the buttons container exists in the dom
        expect(el.querySelector('.pure-form-buttons')).toBeDefined();

        // grab button elements from the DOM, convert to array so we can inspect them
        var elements = Array.prototype.slice.call(el.querySelectorAll('.pure-form-buttons .pure-form-button'));

        // check we have the correct number of buttons
        expect(elements.length).toEqual(buttonValues.length);

        // go through each button element and check it's value is correct
        elements.forEach(function(button, index) {
            expect(button.value).toEqual(buttonValues[index]);
        });
    });


    it('should re-render buttons when reset', function () {

        var buttonValues = ['One', 'Two', 'Three'];
        var el = document.createElement('pure-form');

        el.schema = inlineSchema;

        // convert to CSV string before setting
        el.buttons = buttonValues.join(',');

        // check the buttons container exists in the dom
        expect(el.querySelector('.pure-form-buttons')).toBeDefined();

        // grab button elements from the DOM, convert to array so we can inspect them
        var elements = Array.prototype.slice.call(el.querySelectorAll('.pure-form-buttons .pure-form-button'));

        // check we have the correct number of buttons
        expect(elements.length).toEqual(buttonValues.length);

        // go through each button element and check it's value is correct
        elements.forEach(function(button, index) {
            expect(button.value).toEqual(buttonValues[index]);
        });

        // change buttons property
        var newButtonsValue = 'test' + (new Date()).getTime();
        el.buttons = newButtonsValue;

        // check changes have been reflected
        expect(el.querySelectorAll('.pure-form-buttons').length).toEqual(1);
        expect(el.querySelectorAll('.pure-form-buttons .pure-form-button').length).toEqual(1);
        expect(el.querySelector('.pure-form-buttons .pure-form-button').value).toEqual(newButtonsValue);
    });

    it('should remove buttons when value is cleared', function () {

        var buttonValues = ['One', 'Two', 'Three'];
        var el = document.createElement('pure-form');

        el.schema = inlineSchema;

        // convert to CSV string before setting
        el.buttons = buttonValues.join(',');

        // check the buttons container exists in the dom
        expect(el.querySelector('.pure-form-buttons')).toBeDefined();

        // check we have the correct number of buttons
        expect(el.querySelectorAll('.pure-form-buttons').length).toEqual(1);
        expect(el.querySelectorAll('.pure-form-buttons .pure-form-button').length).toEqual(buttonValues.length);

        // clear
        el.buttons = '';

        // check to ensure the buttons (inc container) have been removed
        expect(el.querySelector('.pure-form-buttons')).toBe(null);
        expect(el.querySelectorAll('.pure-form-buttons .pure-form-button').length).toEqual(0);
    });

    it('should reflect properties as attributes', function () {

        var src = tempSchemaUrl + '?dt=' + (new Date()).getTime();
        var createUrl = tempSchemaUrl + '?dt=' + (new Date()).getTime();
        var updateUrl = tempSchemaUrl + '?dt=' + (new Date()).getTime();
        var title = 'Hello World ' + (new Date()).getTime();
        var description = 'Test description ' + (new Date()).getTime();
        var buttons = 'One, Two, ' + (new Date()).getTime();

        var el = document.createElement('pure-form');

        el.src = src;
        expect(el.getAttribute('src')).toEqual(src);

        el.createUrl = createUrl;
        expect(el.getAttribute('create-url')).toEqual(createUrl);

        el.updateUrl = updateUrl;
        expect(el.getAttribute('update-url')).toEqual(updateUrl);

        el.readonly = true;
        expect(el.getAttribute('readonly')).toEqual('true');

        el.title = title;
        expect(el.getAttribute('title')).toEqual(title);

        el.description = description;
        expect(el.getAttribute('description')).toEqual(description);

        el.buttons = buttons;
        expect(el.getAttribute('buttons')).toEqual(buttons);

        el.persist = true;
        expect(el.getAttribute('persist')).toEqual('true');

        el.disableValidation = true;
        expect(el.getAttribute('disable-validation')).toEqual('true');

        el.autofocusError = true;
        expect(el.getAttribute('autofocus-error')).toEqual('true');

        el.validateOnBlur = true;
        expect(el.getAttribute('validate-onblur')).toEqual('true');
    });

    it('should load JSON schema set via .src attribute', function(done) {

        var el = document.createElement('pure-form');

        el.addEventListener('schema-loaded', function() {
            expect(el.schema).toBeDefined();
            expect(el.schema.id).toEqual('contact-form');
            done();
        });

        el.src = tempSchemaUrl;
    });

});
