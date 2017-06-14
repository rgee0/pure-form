'use strict';

var nock = require('nock');
var jsdom = require('jsdom');
var path = require('path');

var document = null;
var window = null;

var tempSchemaUrl = 'http://localhost:8080/test-schema.json';
var schema404Url = 'http://localhost:8080/404';

// intercept request for schema
nock.disableNetConnect();

describe('pure-form methods', function () {

    // create a new browser instance before each test
    beforeEach(function (done) {

        nock('http://localhost:8080')
            .get('/polyfills/document-register-element.js')
            .replyWithFile(200, path.resolve('./polyfills/document-register-element.js'))
            .get('/src/pure-form.js')
            .replyWithFile(200, path.resolve('./src/pure-form.js'))
            .get('/test-schema.json')
            .query(true)
            .replyWithFile(200, path.resolve('./tests/test-schema.json'))
            .get('/404')
            .reply(404);

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

    it('should set field values', function(done) {

        var el = document.createElement('pure-form');

        var testData = {
            title: 'Mr',
            firstName: 'William ' + (new Date()).getTime(),
            surname: 'Gates ' + (new Date()).getTime()
        };

        el.addEventListener('schema-loaded', function(e) {

            // set the value
            el.value = testData;

            // get the value back
            var output = el.value;

            expect(output.title).toEqual(testData.title);
            expect(output.firstName).toEqual(testData.firstName);
            expect(output.surname).toEqual(testData.surname);
            done();
        });

        el.src = tempSchemaUrl;
    });

    it('should clear field values', function(done) {

        var el = document.createElement('pure-form');

        var testData = {
            title: 'Mr',
            firstName: 'William ' + (new Date()).getTime(),
            surname: 'Gates ' + (new Date()).getTime()
        };

        el.addEventListener('schema-loaded', function(e) {

            // set the value
            el.value = testData;

            // get the value back
            var output = el.value;

            expect(output.title).toEqual(testData.title);
            expect(output.firstName).toEqual(testData.firstName);
            expect(output.surname).toEqual(testData.surname);

            // clear the values
            el.clear();

            // grab the value again
            output = el.value;

            expect(output.title).toEqual('');
            expect(output.firstName).toEqual('');
            expect(output.surname).toEqual('');

            done();
        });

        el.src = tempSchemaUrl;
    });

    it('should set a field invalid when calling .setInvalid', function(done) {

        var el = document.createElement('pure-form');

        var invalidErrorMessage = 'Error' + (new Date()).getTime();

        // once rendered set a field invalid
        el.addEventListener('render-complete', function(e) {

            el.setInvalid('title', invalidErrorMessage);

            var titleLabel = el.querySelector('label[for=title]');
            var titleEl = el.querySelector('select[name=title]');

            expect(titleEl).toBeDefined();
            expect(titleLabel).toBeDefined();

            expect(titleEl.tagName).toEqual('SELECT');
            expect(titleLabel.tagName).toEqual('LABEL');

            expect(titleEl.getAttribute('data-valid')).toEqual('false');
            expect(titleLabel.getAttribute('data-error')).toEqual(invalidErrorMessage);
            done();
        });

        el.src = tempSchemaUrl;
    });


    it('should clear error message when .setValid is called', function(done) {

        var el = document.createElement('pure-form');

        var invalidErrorMessage = 'Error' + (new Date()).getTime();

        // once rendered set a field invalid
        el.addEventListener('render-complete', function(e) {

            el.setInvalid('title', invalidErrorMessage);

            var titleLabel = el.querySelector('label[for=title]');
            var titleEl = el.querySelector('select[name=title]');

            expect(titleEl.getAttribute('data-valid')).toEqual('false');
            expect(titleLabel.getAttribute('data-error')).toEqual(invalidErrorMessage);

            el.setValid('title');
            expect(titleEl.getAttribute('data-valid')).toEqual('true');
            expect(titleLabel.getAttribute('data-error')).toEqual(null);

            done();
        });

        el.src = tempSchemaUrl;
    });


});
