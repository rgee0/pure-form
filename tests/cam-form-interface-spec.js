'use strict';

var nock = require('nock');
var jsdom = require('jsdom');
var path = require('path');

var document = null;
var window = null;

nock.disableNetConnect();

describe('pure-form interface', function () {

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

    it('should be creatable', function () {

        var el = document.createElement('pure-form');

        expect(el).toBeDefined();
        expect(el.tagName).toEqual('PURE-FORM');
    });


    it('should expose properties with correct types', function() {

        var el = document.createElement('pure-form');

        expect(typeof el.src).toEqual('string');
        expect(typeof el.schema).toEqual('object');
        expect(typeof el.value).toEqual('object');
        expect(typeof el.createUrl).toEqual('string');
        expect(typeof el.updateUrl).toEqual('string');
        expect(typeof el.readonly).toEqual('boolean');
        expect(typeof el.title).toEqual('string');
        expect(typeof el.description).toEqual('string');
        expect(Array.isArray(el.buttons)).toEqual(true);
        expect(typeof el.persist).toEqual('boolean');
        expect(typeof el.disableValidation).toEqual('boolean');
        expect(typeof el.placeholderMaxLength).toEqual('number');
    });


    it('should expose properties with defaults', function() {

        var el = document.createElement('pure-form');

        expect(el.src).toEqual('');
        expect(el.schema).toEqual(null);
        expect(JSON.stringify(el.value)).toEqual('{}');
        expect(el.createUrl).toEqual('');
        expect(el.updateUrl).toEqual('');
        expect(el.readonly).toEqual(false);
        expect(el.title).toEqual('');
        expect(el.description).toEqual('');
        expect(el.buttons.length).toEqual(0);
        expect(el.persist).toEqual(false);
        expect(el.disableValidation).toEqual(false);
        expect(el.placeholderMaxLength).toEqual(75);
    });


    it('should expose public methods', function() {

        var el = document.createElement('pure-form');

        expect(typeof el.clearValidationErrors).toEqual('function');
        expect(typeof el.setInvalid).toEqual('function');
        expect(typeof el.setValid).toEqual('function');
        expect(typeof el.validateField).toEqual('function');
        expect(typeof el.isValid).toEqual('function');
    });

    it('should not expose private methods', function() {

        var el = document.createElement('pure-form');

        expect(el.regExMatches).not.toBeDefined();
        expect(el.arrayWhere).not.toBeDefined();
        expect(el.newGuid).not.toBeDefined();
        expect(el.setElementValue).not.toBeDefined();
        expect(el.getSortedSchemaKeys).not.toBeDefined();
        expect(el.getPropertyByPath).not.toBeDefined();
        expect(el.validateAgainstSchema).not.toBeDefined();
        expect(el.cancelEvent).not.toBeDefined();
        expect(el.stringToDOM).not.toBeDefined();
        expect(el.createEl).not.toBeDefined();
        expect(el.schemaItemToHtmlElement).not.toBeDefined();
        expect(el.populateForm).not.toBeDefined();
        expect(el.save).not.toBeDefined();
        expect(el.getRawData).not.toBeDefined();
        expect(el.getData).not.toBeDefined();
        expect(el.renderButtons).not.toBeDefined();
        expect(el.renderDescription).not.toBeDefined();
        expect(el.renderTitle).not.toBeDefined();
        expect(el.renderForm).not.toBeDefined();
    });

});
