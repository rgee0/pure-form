"use strict";

var jsdom = require('jsdom');
var nock = require('nock');
var path = require('path');
var fs = require('fs');

var document = null;
var window = null;

describe('pure-form lifecycle', function () {

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

    it('should not contain children on creation', function () {

        var el = document.createElement('pure-form');

        expect(el.children.length).toEqual(0);
    });

    it('should render title when set', function () {

        var el = document.createElement('pure-form');
        var testString = 'Hello World';
        el.title = testString

        expect(el.textContent.indexOf(testString)).toBeGreaterThan(-1);
    });

    it('should render description when set', function () {

        var el = document.createElement('pure-form');
        var testString = 'A quick form description';
        el.description = testString

        expect(el.textContent.indexOf(testString)).toBeGreaterThan(-1);
    });

});