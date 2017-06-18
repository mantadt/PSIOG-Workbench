'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader


 */


angular.module('sbAdminApp')
    .directive('generator', ['generatorService', function (generatorService) {
        return {
            templateUrl: 'scripts/directives/generator/generator.html',
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
                var nodes = [];
                var links = [];
                var outp = [];
                var semioutp = [];
                var backupArray = [];
                var resultsData;
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


                                console.log(obj);

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
                    console.log(outp);


                    // var startNode = scope.startNode;
                    var startNodeValue = scope.startNode;

                    //var endNode = document.getElementById("endNode");
                    //var endNodeValue = endNode.options[endNode.selectedIndex].value;
                    console.log(startNodeValue);

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
                            console.log(semioutp);


                        }
                    }

                    if (endNodeValue != -1 && startNodeValue == -1) //startNode's value doesnt and endNode's value exist
                    {
                        for (var i = 0; i < outp.length; i++) {

                            if (outp[i].slice(outp[i].lastIndexOf("_") + 1, outp[i].length) == endNodeValue)
                                semioutp.push(outp[i]);

                            else if (outp[i].indexOf("_" + endNodeValue + "_") != -1)

                                semioutp.push(outp[i].slice(0, outp[i].indexOf("_" + endNodeValue + "_") + ("_" + endNodeValue + "_").length));
                            console.log(semioutp);

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
                                console.log(semioutp);

                            }

                            //Handling when startNode isnt at start
                            else if (outp[i].indexOf("_" + startNodeValue + "_") != -1) {

                                if (outp[i].indexOf("_" + endNodeValue + "_") != -1 || outp[i].slice(outp[i].lastIndexOf("_") + 1, outp[i].length) == endNodeValue) {

                                    if (outp[i].slice(outp[i].lastIndexOf("_") + 1, outp[i].length) == endNodeValue) {
                                        semioutp.push(outp[i].slice(outp[i].indexOf("_" + startNodeValue + "_") + 1, outp[i].length));
                                        console.log(semioutp);
                                    }

                                    else if (outp[i].indexOf("_" + startNodeValue + "_") < outp[i].indexOf("_" + endNodeValue + "_")) {
                                        semioutp.push(outp[i].slice(outp[i].indexOf("_" + startNodeValue + "_") + 1, outp[i].indexOf("_" + endNodeValue + "_") + ("_" + endNodeValue + "_").length));
                                        console.log(semioutp);
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

                    console.log(semioutp);
                    semioutp = uniqueRoutes;
                    scope.displayCombinations(semioutp, nodes, links);


                }

                scope.displayCombinations = function (outputArray, nodes, links, first) {
                    //Display combinatiomns
                    //console.log(outputArray);
                    //Displaying
                    var dataTable = [];
                    for (var i = 0; i < outputArray.length; i++) {
                        var testroutes = [];
                        var teststmt = "";
                        var temparray = outputArray[i].split("_");
                        var tempStatement = "";
                        console.log("  ");
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
                        console.log(teststmt);


                        // document.getElementById("testcases").innerHTML += "<li>"+ tempStatement + "\n </li>";
                    }
                    console.log(dataTable);

                    if (first == 'Y')
                        backupArray = dataTable;

                    if (first == 'R') {
                        dataTable = backupArray;
                    }

                    $(document).ready(function () {
                        $('#testCaseTable').DataTable({
                            data: dataTable,
                            dom: 'Bfrtip',
                            "bDestroy": true,
                            columns: [
                                { title: 'S.No', data: 'sno' },
                                { title: 'Test Case', orderable: false, data: 'testcase' }
                            ],
                            buttons: [
                                {
                                    extend: 'copyHtml5',
                                    exportOptions: {
                                        columns: ':contains("Office")'
                                    }
                                },
                                'excelHtml5',
                                'csvHtml5',
                                'pdfHtml5'
                            ]
                        });
                    });


                    document.getElementById("numberofresults").innerHTML = "We generated " + outputArray.length + " test cases for you!\n";


                }





            }
        }
    }]);


