var azService = {
    uploadBlob: uploadBlob,
    deleteBlob: deleteBlob,
    listBlobs: listBlobs,
    getBlob: getBlob
};

var azure = require("azure-storage");
var config = require('../../config');
var streamifier = require('streamifier');
var blobSvc = azure.createBlobService(config.azureStorageAccount, config.azureSharedKey);

function uploadBlob(req, res) {
    var buffer = Buffer.from(req.body.file, 'base64');
    var fileStream = streamifier.createReadStream(buffer);

    blobSvc.createBlockBlobFromStream(config.azureContainer, config.azureAssetsPrefix + req.body.fileName, fileStream,
        buffer.byteLength, { contentSettings: { contentType: req.body.contentType } }, function (error, result, response) {
            if (!error) {
                console.log("blob uploaded");
                res.status(200).send("success");
            }
            else
                res.send("failure");
        });
}

function deleteBlob(req, res) {
    res.status(404).send("failure");
}

function listBlobs(req, res) {
    res.status(404).send("failure");
}

function getBlob(req, res) {
    res.status(404).send("failure");
}

function generateSASToken() {

}

function init() {
    blobSvc.createContainerIfNotExists(config.azureContainer, function (error, result, response) {
        if (!error) {
            console.log("container exists.")
        }
    });
}

init();

module.exports = azService;

