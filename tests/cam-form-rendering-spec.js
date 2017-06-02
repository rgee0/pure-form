'use strict';

var nock = require('nock');
var jsdom = require('jsdom');
var path = require('path');

var document = null;
var window = null;

var tempSchemaUrl = 'http://localhost:8080/schemas/contact-form.json';

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
            .get('/schemas/contact-form.json')
            .query(true)
            .replyWithFile(200, path.resolve('./schemas/contact-form.json'));

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

    it('should render description when set', function () {

        var el = document.createElement('pure-form');
        var testString = 'A quick form description';
        el.description = testString;

        expect(el.querySelector('pure-form-description')).toBeDefined();
        expect(el.querySelectorAll('.pure-form-description').length).toEqual(1);
        expect(el.querySelector('.pure-form-description').textContent).toEqual(testString);
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
