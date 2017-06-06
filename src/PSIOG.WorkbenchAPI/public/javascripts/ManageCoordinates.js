
//var MongoClient = require('mongodb').MongoClient;
//var assert = require('assert');
//var ObjectId = require('mongodb').ObjectID;
//var url = 'mongodb://localhost:27017/WorkBench';

//exports.getConnectionStatus = function (req, res) {
//    // Retrieve
//    // Connect to the db
//    MongoClient.connect(url, function (err, db) {
//        if (!err) {
//            res.send("success");
//        }
//        else {
//            res.send("failure");
//        }
//    });
//}


//exports.addCoordinates = function (req, res) {
//    // Connect to the db
//    MongoClient.connect(url, function (err, db) {
//        if (!err) {
//            db.open(function (err, db) {
//                var collection = db.collection("Coordinates");
//                // Insert a single document
//                collection.insert(req.body);
//                var data = req.body;
//                res.send("Saved Successfully");
//            });
//            // res.send(Success);
//        }
//        else {
//            res.send("failure");
//        }
//    });
//};

//exports.getCoordinates = function (req, res) {
//    res.send("");
//};

//exports.deleteCoordinates = function (req, res) {

//    //var id = parseInt(req.params.id) - 1;
//    //var itemdeleted = product.splice(id, 1)
//    //if (itemdeleted === undefined) {
//    //    res.send("Not Deleted");
//    //}
//    //else {
//    //    ;
//        res.send("");
//    //}
//}