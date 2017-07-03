'use strict';

var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var registrationSchema = require('../schemas/registration-form.json');

function Server() {

    var port = 8080;
    var app = express();

    // take care of CORS/OPTIONS requests
    app.use(cors());

    // setup post body parsing handlers
    app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
    app.use(bodyParser.json({ limit: '10mb' }));

    // capture post backs
    app.post('/contact', function(req, res) {
        res.status(200).json(req.body);
    });

    app.get('/register', function(req, res) {
        res.status(200).json(registrationSchema);
    });

    app.put('/:id', function(req, res) {
        res.status(200).json(req.body);
    });

    // throw an error
    app.put('/:id/error', function(req, res) {
        res.sendStatus(500);
    });

    // serve static content
    app.use(express.static('.', { etag: true, extensions: ['css', 'js', 'png', 'jpg', 'html', 'json'] }));

    // start the server
    app.listen(port, function () {
        console.log('Web server listening on port ' + port);
    });
}

module.express = new Server();
