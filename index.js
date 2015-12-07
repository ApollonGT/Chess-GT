'use strict';

var appName = 'Chess GT';
var appVersion = 'v1.0.0';

var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.set('view engine', 'jade');
app.set('views', 'views');
app.set('json spaces', 2);
app.locals.pretty = true;
app.use("/scripts", express.static( __dirname + '/node_modules/'));
app.use("/media", express.static( __dirname + '/public/img/'));
app.use(express.static(__dirname + '/public/'));
app.use(bodyParser.json());

/* Database Connection */
var MongoClient = require('mongodb').MongoClient
    , assert = require('assert');
var url = 'mongodb://localhost:3717/chess';
/* Database Connection */

/*      Start Server      */
var server_cb = function () {
    var port = server.address().port;
    console.log(appName + ' ' + appVersion + ' listening at http://localhost:%s', port);
}
var server = app.listen(3030, server_cb);
/*      Start Server      */

/* Jade root view */
var root_rt = function (req, res) {
    res.render('index', {
        title: appName,
        version: appVersion
    });
}

/* game api - json response */
/*  LOAD */
var load_game = function (req, res) {
    MongoClient.connect(url, function(error, db) {
        var parameters = req.body;
        if (!error) {
            var games = db.collection('chess_game');
            games.find({"name": parameters.name}).toArray(function(err, docs) {
                res.json(docs);
                db.close();
            });
        }
    });
}

/* SAVE */
var saveGame = function (db, game, callback) {
    var games = db.collection('chess_game');
    games.find({name: game.name}).toArray(function (error, response) {
        if (response.length == 0) {
            games.insertOne(game, function(err, result) {
                if (err) {
                    console.log(err);
                } else if (callback) {
                    callback(result);
                }
                db.close();
            });
        } else {
            games.update({name: game.name}, game, function(err, result) {
                if (err) {
                    console.log(err);
                } else if (callback) {
                    callback(result);
                }
                db.close();
            });
        }
    });
}

var save_game = function (req, res) {
    MongoClient.connect(url, function(error, db) {
        var parameters = req.body;
        var game = {
            name: parameters.name,
            moves: parameters.moves
        };

        saveGame(db, game, function() {
            db.close();
        });
    });
}

/* DELETE */
var deleteGame = function (db, game_name, callback) {
    var games = db.collection('chess_game');

    games.deleteOne({ "name": game_name }, function (error, result) {
        if (error) {
            console.log(err(error));
        }

        callback();
    });
}

var delete_game = function (req, res) {
    MongoClient.connect(url, function(error, db) {
        var parameters = req.body;

        deleteGame(db, parameters.name, function() {
            db.close();
        });
    });
}

/* 404 */
var notfound_rt = function (req, res) {
    res.send("404 - page not found");
}

/* Jade root view */
app.get('/', root_rt);
app.get('/notfound', notfound_rt);
app.post('/load', load_game);
app.post('/save', save_game);
app.post('/delete', delete_game);

app.get('*', function(req, res) { res.redirect('/notfound'); });
