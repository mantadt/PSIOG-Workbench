var product =
    [
        {
            "id": 1,
            "productName": "Pen",
            "productPrice": "200",
            'productStock': "false"
        },
        {
            "id": 2,
            "productName": "Pencil",
            "productPrice": "200",
            "productStock": "false"
        },
    ];



exports.getProducts = function (req, res) {
    res.send(product);
};

exports.addProduct = function (req, res) {
    var data = req.body;
    product.push(data);
    res.send(product);
}

exports.deleteProduct = function (req, res) {

    var id = parseInt(req.params.id) - 1;
    var itemdeleted = product.splice(id, 1)
    if (itemdeleted === undefined) {
        res.send("Not Deleted");
    }
    else {
        ;
        res.send(product);
    }
}


exports.updateProduct = function (req, res) {
    var id = parseInt(req.params.id) - 1;
    var productToUpdate = product[id];
    var data = req.body;

    if (productToUpdate === undefined) {

        res.send("Not Updated");
    }
    else {
        productToUpdate.productName = data.productName;
        productToUpdate.productPrice = data.productPrice;
        productToUpdate.productStock = data.productStock;

        res.send(product);
    }

}



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
//            var collection = db.collection("Coordinates");
//            var body = req.body;
//            collection.insert(body);
//                var data = req.body;
//                res.send("Saved Successfully");
//        }
//        else {
//            res.send("failure");
//        }
//    });
//};

//exports.getCoordinates = function (req, res) {
//    MongoClient.connect(url, function (err, db) {
//        if (!err) {
//            var collection = db.collection("Coordinates");
//            collection.find({}).toArray(function (err, Coordinates) {
//                // so now, we can return all students to the screen.
//                res.status(200).json({ 'Coordinates': Coordinates });
//            });
//        }
//        else {
//            res.send("failure");
//        }
//    });
//};
