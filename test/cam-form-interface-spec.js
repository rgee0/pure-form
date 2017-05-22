"use strict";

var jsdom = require('jsdom');
var nock = require('nock');
var path = require('path');
var fs = require('fs');

var document = null;
var window = null;

describe('pure-form interface', function () {

    // create a new browser instance before each test
    beforeEach(function (done) {

        var virtualConsole = new jsdom.VirtualConsole();

        var options = { 
            contentType: "text/html",
            runScripts: "dangerously",
            resources: "usable",
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

    it('should expose properties with defaults', function() {

        var el = document.createElement('pure-form');

        // properties
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
    });

    it('should expose public methods', function(){

        var el = document.createElement('pure-form');

        // methods
        expect(typeof el.loadSchema).toEqual('function');
        expect(typeof el.clearValidationErrors).toEqual('function');
        expect(typeof el.setError).toEqual('function');
        expect(typeof el.clearError).toEqual('function');
        expect(typeof el.validateField).toEqual('function');
        expect(typeof el.isValid).toEqual('function');
    });

});