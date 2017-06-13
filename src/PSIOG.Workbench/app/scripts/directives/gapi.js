var CLIENT_ID = '523816527790-iudprk57d1nu0lpo28gndlt35gt3kocm.apps.googleusercontent.com';
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
var goJSKey = 5;
var returnResult = { key: goJSKey, assets: [] };

//var SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';
var SCOPES = 'https://www.googleapis.com/auth/drive';

var authorizeButton = document.getElementById('authorize-button');
var signoutButton = document.getElementById('signout-button');

function handleClientLoad() {
    //document.getElementById("viewButton").click();
    gapi.load('client:auth2', initClient);
}

function openTab(evt, tabName) {
    var i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";

    loadImages();
}

function setReturnResult(value) {
    returnResult = value;
    //<td>UrlFragment</td>
    var header = "<tr style='font-weight:bold;'><td>Type</td><td>Name</td></tr>";
    document.getElementById("tableAssets").innerHTML = header;

    document.getElementById("viewList").innerHTML = "";

    if (returnResult.assets.length > 0) {
        document.getElementById("divAssets").style.display = "";

        for (var iLoop = 0; iLoop < returnResult.assets.length; iLoop++) {
            var row = document.getElementById("tableAssets").insertRow(1);
            var values = returnResult.assets[iLoop];

            (row.insertCell(0)).innerHTML = values.assetType;
            (row.insertCell(1)).innerHTML = values.assetName;
            //(row.insertCell(2)).innerHTML = values.assetURL;
        }
    }
}

var fileidJSON;
function initClient() {
    var CLIENT_ID = '523816527790-iudprk57d1nu0lpo28gndlt35gt3kocm.apps.googleusercontent.com';
    var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
    var goJSKey = 5;
    var fID = 5;

    var returnResult = { fileId: fID, key: goJSKey, assets: [] };

    //var SCOPES = 'https://www.googleapis.com/auth/drive.metadata.readonly';
    var SCOPES = 'https://www.googleapis.com/auth/drive';
    var authorizeButton = document.getElementById('authorize-button');
    var signoutButton = document.getElementById('signout-button');
    gapi.client.init({
        discoveryDocs: DISCOVERY_DOCS,
        clientId: CLIENT_ID,
        scope: SCOPES
    }).then(function () {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;

        //insertFileJSON("demo.json", "{'asd':'sdf'}", function (response) { fileidJSON = response.id; }, null);
        //setTimeout(function () { insertFileJSON("demo.json", "{'asd':'sdfsdfsd'}", function () { }, fileidJSON); }, 10000);
    });
}

function updateSigninStatus(isSignedIn) {
    var authorizeButton = document.getElementById('authorize-button');
    var signoutButton = document.getElementById('signout-button');
    if (isSignedIn) {
        authorizeButton.style.display = 'none';
        signoutButton.style.display = 'block';
        listFiles();
    } else {
        authorizeButton.style.display = 'block';
        signoutButton.style.display = 'none';
    }
}

function handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
}


function insertFile(fileData, callback) {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";
    var folderId = '0BzoDXFs-7vFSdTI1TFpqTmk1NVU';

    var reader = new FileReader();
    reader.readAsBinaryString(fileData);
    reader.onload = function (e) {
        var contentType = fileData.type || 'application/octet-stream';
        var metadata = {
            'name': fileData.name,
            'mimeType': contentType,
            parents: [folderId]
        };

        var base64Data = btoa(reader.result);
        var multipartRequestBody =
            delimiter +
            'Content-Type: application/json\r\n\r\n' +
            JSON.stringify(metadata) +
            delimiter +
            'Content-Type: ' + contentType + '\r\n' +
            'Content-Transfer-Encoding: base64\r\n' +
            '\r\n' +
            base64Data +
            close_delim;

        var request = gapi.client.request({
            'path': '/upload/drive/v3/files',
            'method': 'POST',
            'params': { 'uploadType': 'multipart' },
            'headers': {
                'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
            },
            'body': multipartRequestBody
        });
        if (!callback) {
            callback = function (file) {
                console.log(file)
            };
        }
        request.execute(callback);
    }
}


//function uploadFile() {
//                      insertFile(document.getElementById("fileUpload").files[0], function (response) {
//                          notifySuccess();
//                          returnResult.assets.push({ assetType: response.mimeType, assetName: response.name, assetURL: response.id });
//                          document.getElementById("fileUpload").value = "";

//                          if (document.getElementById("tableAssets").getElementsByTagName("tr").length == 0) {
//                              //<td>UrlFragment</td>
//                              var header = "<tr style='font-weight:bold;'><td>Type</td><td>Name</td></tr>";
//                              document.getElementById("tableAssets").innerHTML = header;
//                          }

//                          document.getElementById("divAssets").style.display = "";
//                          var row = document.getElementById("tableAssets").insertRow(1);
//                          (row.insertCell(0)).innerHTML = response.mimeType;
//                          (row.insertCell(1)).innerHTML = "<a src='" + response.id + "'>" + response.name + "</a>";
//                          (row.insertCell(2)).innerHTML = response.id;

//                          var Key = document.getElementById('spnKey');
//                          var jsondata = myDiagram.model.toJson();
//                          var data = JSON.parse(jsondata);  //parse the JSON
//                          var resStr;
//                          $.each(data.nodeDataArray, function (i, el) {
//                              var newdata;
//                              if (this.key === parseInt(Key.innerHTML)) {
//                                  if (!this.assets)
//                                      this.assets = [];
//                                  this.assets.push({ assetType: response.mimeType, assetName: response.name, assetURL: response.id });
//                                  resStr = JSON.stringify(data);
//                              }
//                          });

//                          alert(data);
//                          //myDiagram.model = go.Model.fromJson(data);
//                          //myDiagram.model.setDataProperty('lastModified', (new Date()).toString());
//                          //document.getElementById("mySavedModel").value = myDiagram.model.toJson();

//                          //loadImages();
//                      });
//                  }




var isXHRrunning = false;
async function loadImages() {
    var bool = false;

    if (returnResult.assets.length > 0) {
        var accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
        var divString = "<section class='regular slider'>";

        var viewList = document.getElementById("viewList");
        for (var iLoop = 0; iLoop < returnResult.assets.length; iLoop++) {
            var values = returnResult.assets[iLoop];

            if (values.assetType.indexOf("image") >= 0 && (values.visited == null || typeof values.visited == "undefined" || !values.visited)) {
                $("#imageLoader").show();

                var jLoop = 0
                swapDivs(1);
                bool = true;
                values.visited = true;
                isXHRrunning = true;
                var fileId = values.assetURL;
                var xhr = new XMLHttpRequest();
                xhr.open("GET", "https://www.googleapis.com/drive/v3/files/" + fileId + '?alt=media', true);
                xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
                xhr.responseType = 'arraybuffer';
                xhr.onload = function () {
                    var base64 = 'data:image/png;base64,' + base64ArrayBuffer(xhr.response);

                    //"' data-darkbox='" + base64 + "'data-darkbox-group='one'/></div>
                    divString += " <div><img  height='50' width='50' src='" + base64 + "' data-darkbox='" + base64 + "'data-darkbox-group='one'></div>";
                    //var divOuter = document.createElement("div");

                    //divString += "<b>" + values.assetName + "</b>";

                    // divString += "<br/><br/>";

                    //src = "http://placehold.it/50x50/f0f"
                    //data - darkbox="http://placehold.it/800x600/f0f"
                    //data - darkbox - group="one"

                    //  divOuter.innerHTML = divString;
                    isXHRrunning = false;
                }



                xhr.send();

                //checkXHRAvailable();
                await sleep(2000);
                jLoop++;
            }
            else if (values.visited)
                bool = true;
        }
        divString += "</section>";
        $("#imageLoader").hide();
        viewList.innerHTML = divString;
        $(".regular").slick({
            dots: true,
            infinite: true,
            slidesToShow: 2,
            slidesToScroll: 2
        });


    }

    if (!bool)
        swapDivs(0);
}

async function checkXHRAvailable() {
    if (isXHRrunning) {
        await sleep(2000);
        checkXHRAvailable();
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function stringToArrayBuffer(str) {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);

    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }

    return buf;
}

function base64ArrayBuffer(arrayBuffer) {
    var base64 = ''
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

    var bytes = new Uint8Array(arrayBuffer)
    var byteLength = bytes.byteLength
    var byteRemainder = byteLength % 3
    var mainLength = byteLength - byteRemainder

    var a, b, c, d
    var chunk

    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
        // Combine the three bytes into a single integer
        chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

        // Use bitmasks to extract 6-bit segments from the triplet
        a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
        b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
        c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
        d = chunk & 63               // 63       = 2^6 - 1

        // Convert the raw binary segments to the appropriate ASCII encoding
        base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
        chunk = bytes[mainLength]

        a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

        // Set the 4 least significant bits to zero
        b = (chunk & 3) << 4 // 3   = 2^2 - 1

        base64 += encodings[a] + encodings[b] + '=='
    } else if (byteRemainder == 2) {
        chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

        a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
        b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4

        // Set the 2 least significant bits to zero
        c = (chunk & 15) << 2 // 15    = 2^4 - 1

        base64 += encodings[a] + encodings[b] + encodings[c] + '='
    }

    return base64
}

function swapDivs(value) {
    if (value == 1) {

        document.getElementById("viewError").style.display = "none";
        document.getElementById("viewList").style.display = "";
    }
    else {
        document.getElementById("viewList").style.display = "none";
        document.getElementById("viewError").style.display = "";
    }
}

function listFiles() {

    var select = document.getElementById('ddlJsonList');
    var selectddlFiles = document.getElementById('ddlFiles');

    $('select').empty();

    var opti = document.createElement('option');
    var optiTestcase = document.createElement('option');

    optiTestcase.value = 0;
    optiTestcase.innerHTML = "-Select-";

    opti.value = 0;
    opti.innerHTML = "-Select-";
    select.appendChild(opti);


    gapi.client.drive.files.list({
        'pageSize': 10,
        'fields': "nextPageToken, files(id, name)",
        'q': "'0BzoDXFs-7vFSV3RiLWs0M3hDWWM' in parents"
    }).then(function (response) {
        appendPre('Files:');
        var files = response.result.files;
        if (files && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                //appendPre(file.name);
                var opt = document.createElement('option');
                var optTestcase = document.createElement('option');

                optTestcase.value = file.id;
                optTestcase.innerHTML = file.name;

                opt.value = file.id;
                opt.innerHTML = file.name;
                select.appendChild(opt);
            }
        } else {
            appendPre('No files found.');
        }
    });
}
function appendPre(message) {
    var pre = document.getElementById('content');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
}



$('#ddlJsonList').change(function () {
    $("#divOuterBodder").css("display", "");
    printFile($('#ddlJsonList').val());
});
function printFile(fileId) {
    var accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://www.googleapis.com/drive/v3/files/" + fileId + '?alt=media', true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.responseType = 'text';
    xhr.onload = function () {
        var jsonFile = xhr.response;
        var jsondata = JSON.parse(xhr.response);
        $("#mySavedModel").val(jsondata);
        myDiagram.model = go.Model.fromJson(jsondata);
    }
    xhr.send();
}
