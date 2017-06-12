var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
var url = 'mongodb://localhost:27017/WorkBench';

exports.addFlowchart = function (req, res) {
    // Connect to the db
    MongoClient.connect(url, function (err, db) {
        if (!err) {
            var collection = db.collection("Flowchart");
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

exports.getAllFlowCharts = function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (!err) {
            var collection = db.collection("Flowchart");
            collection.find({}).toArray(function (err, flowchart) {
                // so now, we can return all students to the screen.
                res.status(200).json({ 'Flowchart': flowchart });
            });
        }
        else {
            res.send("failure");
        }
    });
};

exports.getAllFlowChartNames = function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (!err) {
            var collection = db.collection('Flowchart').find({},{"flowChartID" : 1,"flowchartName" : 2,_id : 0})
            .toArray(function (err, flowchart) {
                // so now, we can return all students to the screen.
                res.status(200).json({flowchart });
            });
        }
        else {
            res.send("failure");
        }
    });
};

exports.getFlowChartByID = function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (!err) {

            var query = { flowChartID: req.params.id };
            db.collection("Flowchart").find(query).toArray(function (err, result) {
                if (err) throw err;
                res.status(200).json({ 'Flowchart': result });
                db.close();
            });

        }
        else {
            res.send("failure");
        }
    });

};



exports.getFlowChartByName = function (req, res) {
    MongoClient.connect(url, function (err, db) {
        if (!err) {
            var query = { Name: req.params.id };
            db.collection("Flowchart").find(query).toArray(function (err, result) {
                if (err) throw err;
                res.status(200).json({ 'Flowchart': result });
                db.close();
            });
        }
        else {
            res.send("failure");
        }
    });
};