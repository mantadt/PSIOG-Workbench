var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/WorkBench';

exports.getConnectionStatus = function (req, res) {
    // Retrieve
    // Connect to the db
    MongoClient.connect(url, function (err, db) {
        if (!err) {
            res.send("success");
        }
        else {
            res.send("failure");
        }
    });
}


exports.addCoordinates = function (req, res) {
    // Connect to the db
    MongoClient.connect(url, function (err, db) {
        if (!err) {
            var collection = db.collection("Coordinates");
            var body = req.body;
            collection.insert(body);
            var data = req.body;
            res.send("Saved Successfully");
        }
        else {
            res.send("failure");
        }
    });
};

exports.getCoordinates = function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (!err) {
            var collection = db.collection("Coordinates");
            collection.find({}).toArray(function (err, Coordinates) {
                // so now, we can return all students to the screen.
                res.status(200).json({ 'Coordinates': Coordinates });
            });
        }
        else {
            res.send("failure");
        }
    });
};

exports.getCoordbyFlowId = function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (!err) {

              var query = { flowchartID: req.params.flowId };
            db.collection("Coordinates").find(query).toArray(function (err, Coordinates) {;
                res.status(200).json({ 'Coordinates': Coordinates });
            });
        }
        else {
            res.send("failure");
        }
    });
};




