/// <reference path="../../../views/ui-elements/ViewPresentations.html" />
/// <reference path="../../../views/ui-elements/ViewPresentations.html" />
'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader


 */


angular.module('sbAdminApp')
    .directive('genandview', ['generatorService', 'slideshowService', function (generatorService, slideshowService) {
        return {
            templateUrl: 'scripts/directives/genAndView/genandview.html',
            //template : '<p>HELLO</p>',
            restrict: 'E',
            link: function (scope) {
                scope.xmlpaste = '';
                scope.pastexml = true;
                scope.jsonxmltoggle = true;
                scope.toggleJsonXml = function () {
                    scope.jsonxmltoggle = !scope.jsonxmltoggle;
                }
                scope.ddlValueChanged = function () {
                    console.log(scope.itemSelected);
                }
                scope.jsonfiles = ["1.json", "2.json"];
                var testroutes = [];
                var nodes = [];
                var links = [];
                var outp = [];
                var semioutp = [];
                var backupArray = [];
                var resultsData;
                scope.showcar = false;
                scope.clickedGenerate = function (flag) {

                    if (flag)
                    { scope.displayCombinations(outp, nodes, links); }
                    else {
                        scope.loader = true;
                        scope.pastexml = false;
                        generatorService.generateFromXml(scope.xmlpaste)
                            .then(function (success) {

                                scope.loader = false;
                                scope.results = true;
                                nodes = success.data.nodes;
                                links = success.data.links;
                                resultsData = success.data.results;
                                outp = resultsData;
                                jQuery('<option/>', {
                                    value: -1,
                                    html: " "
                                }).appendTo('#startNode');

                                for (var i = 0; i < nodes.length; i++) {
                                    //creates option tag
                                    jQuery('<option/>', {
                                        value: nodes[i].id,
                                        html: nodes[i].text
                                    }).appendTo('#startNode'); //appends to select if parent div has id dropdown
                                }

                                jQuery('<option/>', {
                                    value: -1,
                                    html: " "
                                }).appendTo('#endNode');


                                for (var i = 0; i < nodes.length; i++) {
                                    //creates option tag
                                    jQuery('<option/>', {
                                        value: nodes[i].id,
                                        html: nodes[i].text
                                    }).appendTo('#endNode'); //appends to select if parent div has id dropdown
                                }
                                scope.startNode = -1;
                                scope.endNode = -1;

                                scope.displayCombinations(outp, nodes, links);
                                console.log(success);
                            }, function (failure) { console.log(failure); });
                    }
                }

                scope.clickedGenerateJSON = function (flag) {

                    if (flag)
                    { scope.displayCombinations(outp, nodes, links); }
                    else {
                        scope.loader = true;
                        scope.pastexml = false;
                        //Pass on the JSON file name, pull in the JSON data, and send it to the generator Service

                        generatorService.getJsonValue(scope.itemSelected.flowChartID)
                            .then(function (pass) {

                                var json = pass.data.Flowchart[0];
                                var obj = { nodes: [], links: [] };

                                var loop = 0;
                                $.each(json.nodeDataArray, function () {
                                    var primary = 'N';
                                    if (loop == 0)
                                        primary = 'P';
                                    obj.nodes.push({ id: this.key, text: this.text, primary: primary });
                                    loop++;
                                });

                                loop = 0;

                                $.each(json.linkDataArray, function () {
                                    var myGuid = GUID();
                                    GUID.register(myGuid);
                                    obj.links.push({ from: this.from, to: this.to, text: this.text, id: myGuid }); //generateUniqueNumber(loop)
                                    loop++;
                                })


                                // console.log(obj);

                                generatorService.generateFromJson(obj)
                                    .then(function (success) {

                                        scope.loader = false;
                                        scope.results = true;
                                        nodes = success.data.nodes;
                                        links = success.data.links;
                                        resultsData = success.data.results;
                                        outp = resultsData;
                                        jQuery('<option/>', {
                                            value: -1,
                                            html: " "
                                        }).appendTo('#startNode');

                                        for (var i = 0; i < nodes.length; i++) {
                                            //creates option tag
                                            jQuery('<option/>', {
                                                value: nodes[i].id,
                                                html: nodes[i].text
                                            }).appendTo('#startNode'); //appends to select if parent div has id dropdown
                                        }

                                        jQuery('<option/>', {
                                            value: -1,
                                            html: " "
                                        }).appendTo('#endNode');


                                        for (var i = 0; i < nodes.length; i++) {
                                            //creates option tag
                                            jQuery('<option/>', {
                                                value: nodes[i].id,
                                                html: nodes[i].text
                                            }).appendTo('#endNode'); //appends to select if parent div has id dropdown
                                        }
                                        scope.startNode = -1;
                                        scope.endNode = -1;

                                        scope.displayCombinations(outp, nodes, links);
                                        console.log(success);
                                    }, function (failure) { console.log(failure); });



                            }, function (fail) { });

                    }
                }

                scope.goBack = function () {
                    scope.pastexml = true;
                    scope.results = false;
                    nodes = [];
                    links = [];
                    //resultsData = [];
                    outp = [];


                }

                scope.nodeList = function () {

                    semioutp = [];
                    //outp = resultsData;
                    //  console.log(outp);


                    // var startNode = scope.startNode;
                    var startNodeValue = scope.startNode;

                    //var endNode = document.getElementById("endNode");
                    //var endNodeValue = endNode.options[endNode.selectedIndex].value;
                    //    console.log(startNodeValue);

                    //var endNode = document.getElementById("endNode");
                    var endNodeValue = scope.endNode;



                    if (startNodeValue == -1 && endNodeValue == -1)
                    { semioutp = outp; }
                    if (startNodeValue != -1 && endNodeValue == -1) //startNode's value and endNode's value doesnt exist
                    {
                        for (var i = 0; i < outp.length; i++) {
                            if (outp[i].slice(0, outp[i].indexOf("_")) == startNodeValue)
                                semioutp.push(outp[i]);

                            if (outp[i].indexOf("_" + startNodeValue + "_") != -1)

                                semioutp.push(outp[i].slice(outp[i].indexOf("_" + startNodeValue + "_") + 1, outp[i].length));
                            //        console.log(semioutp);


                        }
                    }

                    if (endNodeValue != -1 && startNodeValue == -1) //startNode's value doesnt and endNode's value exist
                    {
                        for (var i = 0; i < outp.length; i++) {

                            if (outp[i].slice(outp[i].lastIndexOf("_") + 1, outp[i].length) == endNodeValue)
                                semioutp.push(outp[i]);

                            else if (outp[i].indexOf("_" + endNodeValue + "_") != -1)

                                semioutp.push(outp[i].slice(0, outp[i].indexOf("_" + endNodeValue + "_") + ("_" + endNodeValue + "_").length));
                            //     console.log(semioutp);

                        }
                    }

                    else //startNode's value and endNode's value exist
                    {
                        for (var i = 0; i < outp.length; i++) {
                            //Handling when case starts with given Start Node - when it ends in End Node or when it doesn't
                            if (outp[i].slice(0, outp[i].indexOf("_")) == startNodeValue) {
                                if (outp[i].slice(outp[i].lastIndexOf("_") + 1, outp[i].length) == endNodeValue)
                                    semioutp.push(outp[i]);

                                else if (outp[i].indexOf("_" + endNodeValue + "_") != -1)

                                    semioutp.push(outp[i].slice(0, outp[i].indexOf("_" + endNodeValue + "_") + ("_" + endNodeValue + "_").length));
                                //           console.log(semioutp);

                            }

                            //Handling when startNode isnt at start
                            else if (outp[i].indexOf("_" + startNodeValue + "_") != -1) {

                                if (outp[i].indexOf("_" + endNodeValue + "_") != -1 || outp[i].slice(outp[i].lastIndexOf("_") + 1, outp[i].length) == endNodeValue) {

                                    if (outp[i].slice(outp[i].lastIndexOf("_") + 1, outp[i].length) == endNodeValue) {
                                        semioutp.push(outp[i].slice(outp[i].indexOf("_" + startNodeValue + "_") + 1, outp[i].length));
                                        //     console.log(semioutp);
                                    }

                                    else if (outp[i].indexOf("_" + startNodeValue + "_") < outp[i].indexOf("_" + endNodeValue + "_")) {
                                        semioutp.push(outp[i].slice(outp[i].indexOf("_" + startNodeValue + "_") + 1, outp[i].indexOf("_" + endNodeValue + "_") + ("_" + endNodeValue + "_").length));
                                        //             console.log(semioutp);
                                    }

                                }

                            }




                        }
                    }



                    //Ensuring unique routes
                    var uniqueRoutes = [];
                    $.each(semioutp, function (i, el) {
                        if ($.inArray(el, uniqueRoutes) === -1) uniqueRoutes.push(el);
                    });

                    // console.log(semioutp);
                    semioutp = uniqueRoutes;
                    scope.displayCombinations(semioutp, nodes, links);


                }

                scope.displayCombinations = function (outputArray, nodes, links, first) {
                    //Display combinatiomns
                    //console.log(outputArray);
                    //Displaying
                    var dataTable = [];
                    for (var i = 0; i < outputArray.length; i++) {

                        var teststmt = "";
                        var temparray = outputArray[i].split("_");
                        var tempStatement = "";
                        //    console.log("  ");
                        for (var j = 0; j < temparray.length; j++) {
                            for (var k = 0; k < nodes.length; k++)
                                if (nodes[k].id == temparray[j]) {
                                    tempStatement += " -> " + nodes[k].text;
                                    teststmt += nodes[k].id + "_";
                                }


                            for (var k = 0; k < links.length; k++)
                                if (links[k].id == temparray[j] && (links[k].text != null || links[k].text == ""))
                                    tempStatement += " -> " + links[k].text;




                        }
                        tempStatement = tempStatement.slice(4, tempStatement.length);
                        var pushobject = {};
                        pushobject.sno = i + 1;
                        pushobject.testcase = tempStatement
                        dataTable.push(pushobject);
                        testroutes.push(teststmt);
                        // console.log(teststmt);


                        // document.getElementById("testcases").innerHTML += "<li>"+ tempStatement + "\n </li>";
                    }
                    //    console.log(dataTable);

                    if (first == 'Y')
                        backupArray = dataTable;

                    if (first == 'R') {
                        dataTable = backupArray;
                    }

                    $(document).ready(function () {
                        var table = $('#testCaseTable').DataTable({
                            data: dataTable,
                            select: true,
                            dom: 'Bfrtip',
                            "bDestroy": true,
                            columns: [
                                { title: 'S.No', data: 'sno' },
                                { title: 'Test Case', orderable: false, data: 'testcase' },
                                {
                                    title: 'Select',
                                    orderable: false,
                                    searchable: false,
                                    className: 'dt-center',
                                    data: 'sno',
                                    render: function (data, type, full, meta) {
                                        data = '<input type="radio" name="testid" value="' + data + '">';
                                        return data;
                                    }
                                }
                            ]
                        });

                        //$('#testCaseTable tbody').on('click', 'tr', function () {
                        //    var rowindex = table.row(this).index();
                        //    var blockId = testroutes[rowindex];
                        //    blockId = blockId.slice(0, blockId.length - 1);
                        //    var flowchartID = scope.itemSelected.flowChartID;
                        //    // console.log(flowchartID + ","+blockId);
                        //    slideshowService.getSlideshowJSON(flowchartID, blockId).
                        //        then(function success(res) {
                        //            //console.log(res);
                        //            imageData = res;
                        //            getMyData(imageData);
                        //            loadImagesDir(imageData);
                        //        }//,function errorCallback(response) {
                        //        //      console.log(response.statusText);
                        //        );

                        //});


                    });
                }

                scope.generatePresentation = function () {
                    var imageData;
                    if (jQuery("input[name='testid']").is(':checked')) {
                        jQuery.blockUI();
                        var rowindex = Number(jQuery("input[name='testid']:checked").val()) - 1;
                        var blockId = testroutes[rowindex];
                        blockId = blockId.slice(0, blockId.length - 1);
                        var flowchartID = scope.itemSelected.flowChartID;
                        // console.log(flowchartID + ","+blockId);
                        slideshowService.getSlideshowJSON(flowchartID, blockId).
                            then(function success(res) {
                                //console.log(res);
                                imageData = res;
                                getMyData(imageData);
                                loadImagesDir(imageData);
                            }//,function errorCallback(response) {
                            //      console.log(response.statusText);
                            );
                    }
                    else
                        alert("Please select a flow!");
                }

                var divString;
                function loadImagesDir(returnResult) {
                    var bool = false;
                    divString = "";

                    if (returnResult.coOrdinates && returnResult.coOrdinates.length > 0) {
                        // PNotify.removeAll();
                        var accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;

                        for (var iLoop = 0; iLoop < returnResult.coOrdinates.length; iLoop++) {
                            var values = returnResult.coOrdinates[iLoop];
                            var fileId = values.fileId;

                            requestXHR("https://www.googleapis.com/drive/v3/files/" + fileId + '?alt=media', accessToken, iLoop);
                        }
                    }
                    else
                        alert('No usability images found!');


                }

                var xmlHttpReqQueue = new Array();
                function requestXHR(url, accessToken, iLoop) {
                    var vClass = "";
                    var xmlHttpReq;
                    var str = url;
                    var n = str.lastIndexOf("/");
                    var m = str.indexOf("?");
                    var fileId = str.substring(n + 1, m);
                    xmlHttpReq = new XMLHttpRequest()
                    xmlHttpReq.onload = function () {
                        xmlHttpReqQueue.shift();
                        jQuery("img.imgFirstClick").click();                        

                        var base64 = 'data:image/png;base64,' + base64ArrayBufferDir(xmlHttpReq.response);
                        if (iLoop == 0)
                            vClass = "class='imgFirstClick'";
                        //rewrie
                        divString += " <div><img id = imageView" + iLoop + " height='50' " + vClass + " width='50' src='" + base64 + "' data-darkbox='" + base64 + "' data-darkbox-group='one'" + " data-darkbox-description='" + fileId + "'></div>";
                        if (xmlHttpReqQueue.length > 0)
                            xmlHttpReqQueue[0].send(null);
                        else {
                            jQuery('div.divUnclearVP').remove();
                            var el = angular.element("<div class='divUnclearVP' style='display:none'></div>");
                            el.append(divString);
                            // $compile(el)(scope);
                            jQuery("#myCarousel").append(el);
                            jQuery("img.imgFirstClick").click();
                            jQuery.unblockUI();

                        }
                    }

                    xmlHttpReq.open('GET', url, true);
                    xmlHttpReq.setRequestHeader('Authorization', 'Bearer ' + accessToken);
                    xmlHttpReq.responseType = 'arraybuffer';
                    xmlHttpReqQueue.push(xmlHttpReq);

                    if (xmlHttpReqQueue.length == 1) {
                        xmlHttpReq.send(null);
                    }
                }

                function base64ArrayBufferDir(arrayBuffer) {
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

                    return base64;
                    // }


                }





            }
        }
    }]);


