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
            .replyWithFile(200, path.resolve('./schemas/contact-form.json'))
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

    it('should fire schema-loaded event when schema loaded', function(done) {

        var el = document.createElement('pure-form');

        el.addEventListener('schema-loaded', function() {
            expect(el.schema).toBeDefined();
            expect(el.schema.id).toEqual('contact-form');
            done();
        });

        el.src = tempSchemaUrl;
    });

    it('should fire schema-errored event when schema fails to load', function(done) {

        var el = document.createElement('pure-form');

        el.addEventListener('schema-errored', function() {
            expect(el.schema).toBe(null);
            done();
        });

        el.src = 'http://localhost:8080/404';
    });

});
