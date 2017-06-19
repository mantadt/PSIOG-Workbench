angular.module('sbAdminApp')
    .directive('goDiagram', function ($http, $compile, config) {
        return {
            restrict: 'E',
            template: '<div></div>',  // just an empty DIV element
            replace: true,
            scope: { model: '=goModel', op: '@', blkid: '=blockId' },
            link: function (scope, element, attrs) {

                var $ = go.GraphObject.make;  // for conciseness in defining templates

                var diagram =
                    $(go.Diagram, element[0],  // must name or refer to the DIV HTML element
                        {
                            initialContentAlignment: go.Spot.Center,
                            allowDrop: true,  // must be true to accept drops from the Palette
                            "LinkDrawn": showLinkLabel,  // this DiagramEvent l istener is defined below
                            "LinkRelinked": showLinkLabel,
                            "animationManager.duration": 800, // slightly longer than default (600ms) animation
                            "undoManager.isEnabled": true  // enable undo & redo
                        });

                // when the document is modified, add a "*" to the title and enable the "Save" button
                diagram.addDiagramListener("Modified", function (e) {
                    var button = document.getElementById("SaveButton");
                    if (button) button.disabled = !diagram.isModified;
                    var idx = document.title.indexOf("*");
                    if (diagram.isModified) {
                        if (idx < 0) document.title += "*";
                    } else {
                        if (idx >= 0) document.title = document.title.substr(0, idx);
                    }
                });


                diagram.addDiagramListener("ObjectContextClicked",
                    function (e) {
                        if (scope.op == 1)
                            OpenPopup(e.subject.part.data);
                        else {
                            CreateCarousel(e.subject.part.data);
                        }
                        //alert('singleclick');
                        //var part = e.subject.part;
                        //if (!(part instanceof go.Link)) showMessage("Clicked on " + part.data.key);
                    });

                function CreateCarousel(val) {
                    var blockId = val.key;
                    var flowchartId = scope.$parent.itemSelected.flowChartID;
                    var imagesC = [];

                    jQuery.blockUI();

                    scope.blkid = val.key;

                    $http({
                        method: 'GET',
                        url: config.baseUrl + 'getFlowChartByFlowIdBlockId/' + flowchartId + '/' + blockId,
                        data: {},
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8'
                        }
                    }).then(function successCallback(response) {
                        imagesC = response.data.Flowchart[0].nodeDataArray;
                        loadImagesDir(imagesC);
                    }, function errorCallback(response) {
                        console.log(response.statusText);
                    });
                }

                var divString = "";
                function loadImagesDir(returnResult) {
                    var bool = false;
                    divString = "";
                    if (returnResult.assets && returnResult.assets.length > 0) {
                        PNotify.removeAll();
                        var accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;

                        for (var iLoop = 0; iLoop < returnResult.assets.length; iLoop++) {
                            var values = returnResult.assets[iLoop];

                            if (values.assetType.indexOf("image") >= 0 && (values.visited == null || typeof values.visited == "undefined" || !values.visited)) {
                                var vClass = "";

                                bool = true;
                                values.visited = true;
                                var fileId = values.assetURL;

                                requestXHR("https://www.googleapis.com/drive/v3/files/" + fileId + '?alt=media', accessToken, iLoop);
                            }
                            else if (values.visited)
                                bool = true;
                        }
                    }
                    else
                    {
                        jQuery.unblockUI();
                        notifyUSFailure();
                    }
                      
                }

                var xmlHttpReqQueue = new Array();
                function requestXHR(url, accessToken, iLoop) {
                    var xmlHttpReq;
                    var str = url;
                    var n = str.lastIndexOf("/");
                    var m = str.indexOf("?");
                    var fileId = str.substring(n + 1, m);
                    xmlHttpReq = new XMLHttpRequest()
                    xmlHttpReq.onload = function () {
                        xmlHttpReqQueue.shift();

                        var base64 = 'data:image/png;base64,' + base64ArrayBufferDir(xmlHttpReq.response);
                        if (iLoop == 0)
                            vClass = "class='imgFirstClick'";

                        divString += " <div><img height='50' " + vClass + " width='50' src='" + base64 + "' data-darkbox='" + base64 + "' data-darkbox-group='one'" + " data-darkbox-description='" + fileId + "'></div>";
                        if (xmlHttpReqQueue.length > 0)
                            xmlHttpReqQueue[0].send(null);
                        else {
                            jQuery('.divUnclear').remove();
                            var el = angular.element("<div class='divUnclear' style='display:none'></div>");
                            el.append(divString);
                            $compile(el)(scope);
                            element.append(el);
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
                }


                function OpenPopup(obj) {

                   jQuery('ul.tabs li').click(function () {
                       var tab_id = jQuery(this).attr('data-toggle');

                        jQuery('ul.tabs li').removeClass('current');
                        jQuery('.tab-content').removeClass('current');

                        jQuery(this).addClass('current');
                        jQuery(tab_id).addClass('current');
                    })
                    document.getElementById("imageLoader").style.display = "none";

                    // createWindowWithHtml();

                    var modal = document.getElementById('myModal');
                    var spanKey = document.getElementById('spnKey');
                    var spanText = document.getElementById('spnText');
                    spanText.innerText = obj.text;
                    spanKey.innerText = obj.key;
                    modal.style.display = "block";
                    var obj = { key: Number(spanKey), assets: [] };

                    var jsondata = diagram.model.toJson();
                    var data = JSON.parse(jsondata);

                    //$.each(data.nodeDataArray, function (i, el) {
                    //    var newdata;
                    //    if (this.key === parseInt(spanKey))
                    //        obj.assets = value.assets;
                    //});

                    for (var iL = 0; iL < data.nodeDataArray.length; iL++) {

                        if (data.nodeDataArray[iL].key == parseInt(spanKey.innerText) && data.nodeDataArray[iL].assets) {

                            obj.assets = data.nodeDataArray[iL].assets;
                        }

                    }

                    setReturnResult(obj);
                    loadImages();
                    // loadImagesAsList();
                }


                // helper definitions for node templates

                function nodeStyle() {
                    return [
                        // The Node.location comes from the "loc" property of the node data,
                        // converted by the Point.parse static method.
                        // If the Node.location is changed, it updates the "loc" property of the node data,
                        // converting back using the Point.stringify static method.
                        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                        {
                            // the Node.location is at the center of each node
                            locationSpot: go.Spot.Center,
                            //isShadowed: true,
                            //shadowColor: "#888",
                            // handle mouse enter/leave events to show/hide the ports
                            mouseEnter: function (e, obj) { showPorts(obj.part, true); },
                            mouseLeave: function (e, obj) { showPorts(obj.part, false); }
                        }
                    ];
                }

                // Define a function for creating a "port" that is normally transparent.
                // The "name" is used as the GraphObject.portId, the "spot" is used to control how links connect
                // and where the port is positioned on the node, and the boolean "output" and "input" arguments
                // control whether the user can draw links from or to the port.
                function makePort(name, spot, output, input) {
                    // the port is basically just a small circle that has a white stroke when it is made visible
                    return $(go.Shape, "Circle",
                        {
                            fill: "transparent",
                            stroke: null,  // this is changed to "white" in the showPorts function
                            desiredSize: new go.Size(8, 8),
                            alignment: spot, alignmentFocus: spot,  // align the port on the main Shape
                            portId: name,  // declare this object to be a "port"
                            fromSpot: spot, toSpot: spot,  // declare where links may connect at this port
                            fromLinkable: output, toLinkable: input,  // declare whether the user may draw links to/from here
                            cursor: "pointer"  // show a different cursor to indicate potential link point
                        });
                }

                // define the Node templates for regular nodes

                var lightText = 'whitesmoke';

                diagram.nodeTemplateMap.add("",  // the default category
                    $(go.Node, "Spot", nodeStyle(),
                        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
                        $(go.Panel, "Auto",
                            $(go.Shape, "Rectangle",
                                { fill: "#00A9C9", stroke: null },
                                new go.Binding("figure", "figure")),
                            $(go.TextBlock,
                                {
                                    font: "bold 11pt Helvetica, Arial, sans-serif",
                                    stroke: lightText,
                                    margin: 8,
                                    maxSize: new go.Size(160, NaN),
                                    wrap: go.TextBlock.WrapFit,
                                    editable: true
                                },
                                new go.Binding("text").makeTwoWay())
                        ),
                        // four named ports, one on each side:
                        makePort("T", go.Spot.Top, false, true),
                        makePort("L", go.Spot.Left, true, true),
                        makePort("R", go.Spot.Right, true, true),
                        makePort("B", go.Spot.Bottom, true, false)
                    ));

                diagram.nodeTemplateMap.add("Start",
                    $(go.Node, "Spot", nodeStyle(),
                        $(go.Panel, "Auto",
                            $(go.Shape, "Circle",
                                { minSize: new go.Size(40, 40), fill: "#79C900", stroke: null }),
                            $(go.TextBlock, "Start",
                                { font: "bold 11pt Helvetica, Arial, sans-serif", stroke: lightText },
                                new go.Binding("text"))
                        ),
                        // three named ports, one on each side except the top, all output only:
                        makePort("L", go.Spot.Left, true, false),
                        makePort("R", go.Spot.Right, true, false),
                        makePort("B", go.Spot.Bottom, true, false)
                    ));

                diagram.nodeTemplateMap.add("End",
                    $(go.Node, "Spot", nodeStyle(),
                        $(go.Panel, "Auto",
                            $(go.Shape, "Circle",
                                { minSize: new go.Size(40, 40), fill: "#DC3C00", stroke: null }),
                            $(go.TextBlock, "End",
                                { font: "bold 11pt Helvetica, Arial, sans-serif", stroke: lightText },
                                new go.Binding("text"))
                        ),
                        // three named ports, one on each side except the bottom, all input only:
                        makePort("T", go.Spot.Top, false, true),
                        makePort("L", go.Spot.Left, false, true),
                        makePort("R", go.Spot.Right, false, true)
                    ));

                diagram.nodeTemplateMap.add("Comment",
                    $(go.Node, "Auto", nodeStyle(),
                        $(go.Shape, "File",
                            { fill: "#EFFAB4", stroke: null }),
                        $(go.TextBlock,
                            {
                                margin: 5,
                                maxSize: new go.Size(200, NaN),
                                wrap: go.TextBlock.WrapFit,
                                textAlign: "center",
                                editable: true,
                                font: "bold 12pt Helvetica, Arial, sans-serif",
                                stroke: '#454545'
                            },
                            new go.Binding("text").makeTwoWay())
                        // no ports, because no links are allowed to connect with a comment
                    ));


                // replace the default Link template in the linkTemplateMap
                diagram.linkTemplate =
                    $(go.Link,  // the whole link panel
                        {
                            routing: go.Link.AvoidsNodes,
                            curve: go.Link.JumpOver,
                            corner: 5, toShortLength: 4,
                            relinkableFrom: true,
                            relinkableTo: true,
                            reshapable: true,
                            resegmentable: true,
                            // mouse-overs subtly highlight links:
                            mouseEnter: function (e, link) { link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)"; },
                            mouseLeave: function (e, link) { link.findObject("HIGHLIGHT").stroke = "transparent"; }
                        },
                        new go.Binding("points").makeTwoWay(),
                        $(go.Shape,  // the highlight shape, normally transparent
                            { isPanelMain: true, strokeWidth: 8, stroke: "transparent", name: "HIGHLIGHT" }),
                        $(go.Shape,  // the link path shape
                            { isPanelMain: true, stroke: "gray", strokeWidth: 2 }),
                        $(go.Shape,  // the arrowhead
                            { toArrow: "standard", stroke: null, fill: "gray" }),
                        $(go.Panel, "Auto",  // the link label, normally not visible
                            { visible: false, name: "LABEL", segmentIndex: 2, segmentFraction: 0.5 },
                            new go.Binding("visible", "visible").makeTwoWay(),
                            $(go.Shape, "RoundedRectangle",  // the label shape
                                { fill: "#F8F8F8", stroke: null }),
                            $(go.TextBlock, "Yes",  // the label
                                {
                                    textAlign: "center",
                                    font: "10pt helvetica, arial, sans-serif",
                                    stroke: "#333333",
                                    editable: true
                                },
                                new go.Binding("text").makeTwoWay())
                        )
                    );

                // Make link labels visible if coming out of a "conditional" node.
                // This listener is called by the "LinkDrawn" and "LinkRelinked" DiagramEvents.
                function showLinkLabel(e) {
                    var label = e.subject.findObject("LABEL");
                    if (label !== null) label.visible = (e.subject.fromNode.data.figure === "Diamond");
                }

                // temporary links used by LinkingTool and RelinkingTool are also orthogonal:
                diagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
                diagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;
                //need to load from DB
                //load();  // load an initial diagram from some JSON text

                // initialize the Palette that is on the left side of the page
                //myPalette =
                //    $(go.Palette, "myPaletteDiv",  // must name or refer to the DIV HTML element
                //        {
                //            "animationManager.duration": 800, // slightly longer than default (600ms) animation
                //            nodeTemplateMap: myDiagram.nodeTemplateMap,  // share the templates used by myDiagram
                //            model: new go.GraphLinksModel([  // specify the contents of the Palette
                //                { category: "Start", text: "Start" },
                //                { text: "Step" },
                //                { text: "???", figure: "Diamond" },
                //                { category: "End", text: "End" },
                //                { category: "Comment", text: "Comment" }
                //            ])
                //        });

                // The following code overrides GoJS focus to stop the browser from scrolling
                // the page when either the Diagram or Palette are clicked or dragged onto.

                function customFocus() {
                    var x = window.scrollX || window.pageXOffset;
                    var y = window.scrollY || window.pageYOffset;
                    go.Diagram.prototype.doFocus.call(this);
                    window.scrollTo(x, y);
                }

                diagram.doFocus = customFocus;
                //myPalette.doFocus = customFocus;

                // whenever a GoJS transaction has finished modifying the model, update all Angular bindings
                function updateAngular(e) {
                    if (e.isTransactionFinished) {
                        scope.$apply();
                    }
                }

                // update the Angular model when the Diagram.selection changes
                function updateSelection(e) {
                    diagram.model.selectedNodeData = null;
                    var it = diagram.selection.iterator;
                    while (it.next()) {
                        var selnode = it.value;
                        // ignore a selected link or a deleted node
                        if (selnode instanceof go.Node && selnode.data !== null) {
                            diagram.model.selectedNodeData = selnode.data;
                            break;
                        }
                    }
                    scope.$apply();
                }

                // notice when the value of "model" changes: update the Diagram.model
                scope.$watch("model", function (newmodel) {
                    var oldmodel = diagram.model;
                    if (oldmodel !== newmodel) {
                        diagram.removeDiagramListener("ChangedSelection", updateSelection);
                        diagram.model = newmodel;
                        diagram.addDiagramListener("ChangedSelection", updateSelection);
                    }
                });

                scope.$watch("model.selectedNodeData.name", function (newname) {
                    if (!diagram.model.selectedNodeData) return;
                    // disable recursive updates
                    diagram.removeModelChangedListener(updateAngular);
                    // change the name
                    diagram.startTransaction("change name");
                    // the data property has already been modified, so setDataProperty would have no effect
                    var node = diagram.findNodeForData(diagram.model.selectedNodeData);
                    if (node !== null) node.updateTargetBindings("name");
                    diagram.commitTransaction("change name");
                    // re-enable normal updates
                    diagram.addModelChangedListener(updateAngular);
                });

                scope.diagram = diagram;
                scope.$root.diagram = diagram;
                //scope.custom = functon(){};
            }
        };
    })

    .directive('goPalatte', function () {
        return {
            restrict: 'E',
            template: '<div></div>',  // just an empty DIV element
            replace: true,
            scope: { model: '=goModel' },
            link: function (scope, element, attrs) {
                var $ = go.GraphObject.make;
                var lightText = 'whitesmoke';
                var diagram =  // create a Diagram for the given HTML DIV element
                    $(go.Palette, element[0],  // must name or refer to the DIV HTML element
                        {
                            "animationManager.duration": 800, // slightly longer than default (600ms) animation
                            //nodeTemplateMap: diagram.nodeTemplateMap,  // share the templates used by diagram
                            model: new go.GraphLinksModel([  // specify the contents of the Palette
                                { category: "Start", text: "Start" },
                                { text: "Step", figure: "Rectangle", tetx: "Process" },
                                { text: "???", figure: "Diamond" },
                                { category: "Input", figure: "Input", text: "Input" },
                                { category: "Comment", text: "Comment" },
                                { category: "End", text: "End" }

                            ])
                        });

                diagram.nodeTemplateMap.add("",  // the default category
                    $(go.Node, "Spot", nodeStyle(),
                        // the main object is a Panel that surrounds a TextBlock with a rectangular Shape
                        $(go.Panel, "Auto",
                            $(go.Shape, "Rectangle",
                                { fill: "#00A9C9", stroke: null },
                                new go.Binding("figure", "figure")),
                            $(go.TextBlock,
                                {
                                    font: "bold 11pt Helvetica, Arial, sans-serif",
                                    stroke: lightText,
                                    margin: 8,
                                    maxSize: new go.Size(160, NaN),
                                    wrap: go.TextBlock.WrapFit,
                                    editable: true
                                },
                                new go.Binding("text").makeTwoWay())
                        ),
                        // four named ports, one on each side:
                        makePort("T", go.Spot.Top, false, true),
                        makePort("L", go.Spot.Left, true, true),
                        makePort("R", go.Spot.Right, true, true),
                        makePort("B", go.Spot.Bottom, true, false)
                    ));

                diagram.nodeTemplateMap.add("Start",
                    $(go.Node, "Spot", nodeStyle(),
                        $(go.Panel, "Auto",
                            $(go.Shape, "Circle",
                                { minSize: new go.Size(40, 40), fill: "#79C900", stroke: null }),
                            $(go.TextBlock, "Start",
                                { font: "bold 11pt Helvetica, Arial, sans-serif", stroke: lightText },
                                new go.Binding("text"))
                        ),
                        // three named ports, one on each side except the top, all output only:
                        makePort("L", go.Spot.Left, true, false),
                        makePort("R", go.Spot.Right, true, false),
                        makePort("B", go.Spot.Bottom, true, false)
                    ));

                diagram.nodeTemplateMap.add("End",
                    $(go.Node, "Spot", nodeStyle(),
                        $(go.Panel, "Auto",
                            $(go.Shape, "Circle",
                                { minSize: new go.Size(40, 40), fill: "#DC3C00", stroke: null }),
                            $(go.TextBlock, "End",
                                { font: "bold 11pt Helvetica, Arial, sans-serif", stroke: lightText },
                                new go.Binding("text"))
                        ),
                        // three named ports, one on each side except the bottom, all input only:
                        makePort("T", go.Spot.Top, false, true),
                        makePort("L", go.Spot.Left, false, true),
                        makePort("R", go.Spot.Right, false, true)
                    ));

                diagram.nodeTemplateMap.add("Comment",
                    $(go.Node, "Auto", nodeStyle(),
                        $(go.Shape, "File",
                            { fill: "#EFFAB4", stroke: null }),
                        $(go.TextBlock,
                            {
                                margin: 5,
                                maxSize: new go.Size(200, NaN),
                                wrap: go.TextBlock.WrapFit,
                                textAlign: "center",
                                editable: true,
                                font: "bold 12pt Helvetica, Arial, sans-serif",
                                stroke: '#454545'
                            },
                            new go.Binding("text").makeTwoWay())
                        // no ports, because no links are allowed to connect with a comment
                    ));
                // replace the default Link template in the linkTemplateMap
                diagram.linkTemplate =
                    $(go.Link,  // the whole link panel
                        {
                            routing: go.Link.AvoidsNodes,
                            curve: go.Link.JumpOver,
                            corner: 5, toShortLength: 4,
                            relinkableFrom: true,
                            relinkableTo: true,
                            reshapable: true,
                            resegmentable: true,
                            // mouse-overs subtly highlight links:
                            mouseEnter: function (e, link) {
                                link.findObject("HIGHLIGHT").stroke = "rgba(30,144,255,0.2)";
                                // alert('enter');
                            },
                            mouseLeave: function (e, link) { link.findObject("HIGHLIGHT").stroke = "transparent"; }
                        },
                        new go.Binding("points").makeTwoWay(),
                        $(go.Shape,  // the highlight shape, normally transparent
                            { isPanelMain: true, strokeWidth: 8, stroke: "transparent", name: "HIGHLIGHT" }),
                        $(go.Shape,  // the link path shape
                            { isPanelMain: true, stroke: "gray", strokeWidth: 2 }),
                        $(go.Shape,  // the arrowhead
                            { toArrow: "standard", stroke: null, fill: "gray" }),
                        $(go.Panel, "Auto",  // the link label, normally not visible
                            { visible: false, name: "LABEL", segmentIndex: 2, segmentFraction: 0.5 },
                            new go.Binding("visible", "visible").makeTwoWay(),
                            $(go.Shape, "RoundedRectangle",  // the label shape
                                { fill: "#F8F8F8", stroke: null }),
                            $(go.TextBlock, "Yes",  // the label
                                {
                                    textAlign: "center",
                                    font: "10pt helvetica, arial, sans-serif",
                                    stroke: "#333333",
                                    editable: true
                                },
                                new go.Binding("text").makeTwoWay())
                        )
                    );

                function nodeStyle() {
                    return [
                        // The Node.location comes from the "loc" property of the node data,
                        // converted by the Point.parse static method.
                        // If the Node.location is changed, it updates the "loc" property of the node data,
                        // converting back using the Point.stringify static method.
                        new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
                        {
                            // the Node.location is at the center of each node
                            locationSpot: go.Spot.Center,
                            //isShadowed: true,
                            //shadowColor: "#888",
                            // handle mouse enter/leave events to show/hide the ports
                            mouseEnter: function (e, obj) {
                                showPorts(obj.part, true);
                                if (!(obj.part.data.key <= -1 && obj.part.data.key >= -5)) {
                                    // test(obj.part.data);
                                }
                            },
                            mouseLeave: function (e, obj) { showPorts(obj.part, false); },

                            //mouseDrop: function (e, node) {
                            //    test(obj.part.data);
                            //}

                        }
                    ];
                }

                function showLinkLabel(e) {
                    var label = e.subject.findObject("LABEL");
                    if (label !== null) label.visible = (e.subject.fromNode.data.figure === "Diamond");
                }

                // temporary links used by LinkingTool and RelinkingTool are also orthogonal:
                diagram.toolManager.linkingTool.temporaryLink.routing = go.Link.Orthogonal;
                diagram.toolManager.relinkingTool.temporaryLink.routing = go.Link.Orthogonal;

                // Define a function for creating a "port" that is normally transparent.
                // The "name" is used as the GraphObject.portId, the "spot" is used to control how links connect
                // and where the port is positioned on the node, and the boolean "output" and "input" arguments
                // control whether the user can draw links from or to the port.
                function makePort(name, spot, output, input) {
                    // the port is basically just a small circle that has a white stroke when it is made visible
                    return $(go.Shape, "Circle",
                        {

                            fill: "transparent",
                            stroke: null,  // this is changed to "white" in the showPorts function
                            desiredSize: new go.Size(8, 8),
                            alignment: spot, alignmentFocus: spot,  // align the port on the main Shape
                            portId: name,  // declare this object to be a "port"
                            fromSpot: spot, toSpot: spot,  // declare where links may connect at this port
                            fromLinkable: output, toLinkable: input,  // declare whether the user may draw links to/from here
                            cursor: "pointer"  // show a different cursor to indicate potential link point
                        });
                }

                function customFocus() {
                    var x = window.scrollX || window.pageXOffset;
                    var y = window.scrollY || window.pageYOffset;
                    go.Diagram.prototype.doFocus.call(this);
                    window.scrollTo(x, y);
                }

                diagram.doFocus = customFocus;
                //myPalette.doFocus = customFocus;

            }
        };
    })

    //for sorting
    .directive("sortable", function () {
        return {
            restrict: "C",
            link: function (scope, element, attrs) {
                element.sortable();
            }
        }
    })
    .controller('MinimalCtrl', function ($scope, $rootScope, $http, slideshowService, config) {
        $scope.model = new go.GraphLinksModel(
            [
                { "category": "Start", "text": "Start", "key": -1, "loc": "-317 -502" },
                { "text": "Process", "figure": "Rectangle", "tetx": "Process", "key": -2, "loc": "-317 -418" },
                { "text": "???", "figure": "Diamond", "key": -3, "loc": "-317 -273" },
                { "category": "Input", "figure": "Input", "text": "Input", "key": -4, "loc": "-317 -349" },
                { "category": "End", "text": "End", "key": -6, "loc": "-315 -164" }
            ],
            [
                { "from": -1, "to": -2, "fromPort": "B", "toPort": "T", "points": [-317, -476.79069767441854, -317, -466.79069767441854, -317, -455.5453488372093, -317, -455.5453488372093, -317, -444.3, -317, -434.3] },
                { "from": -2, "to": -4, "fromPort": "B", "toPort": "T", "points": [-317, -401.7, -317, -391.7, -317, -383.5, -317, -383.5, -317, -375.3, -317, -365.3] },
                { "from": -4, "to": -3, "fromPort": "B", "toPort": "T", "points": [-317, -332.7, -317, -322.7, -317, -318.9, -317, -318.9, -317, -315.1, -317, -305.1] },
                { "from": -3, "to": -6, "fromPort": "B", "toPort": "T", "visible": true, "points": [-317, -240.90000000000003, -317, -230.90000000000003, -317, -212.87441860465117, -315, -212.87441860465117, -315, -194.84883720930233, -315, -184.84883720930233] }
            ]
        );

        $scope.slideshow = function () {
            slideshowService.getSlideshowJSON('00d86a61-e963-48cc-8e59-acf10a9cb213', '-1_-2_-4_-3_-6').then(function (res) {
                var data = res;
            });
        }

        $scope.saveUsability = function () {
            flowchartID = $scope.itemSelected.flowChartID;
            blockID = $scope.blkid; 
            var imageCount = finalCords.length;
           
            for(var i =0; i<imageCount ; i++)
            {
                var item = { "flowchartID": flowchartID, "blockID": blockID, "FileID" : finalCords[i].ImageID, "coordinates":  finalCords[i].coordinates};
                var data  = angular.toJson(item, true);
                var url = config.baseUrl + 'addCoordinates';
               // console.log("post");
                console.log(JSON.stringify(data));
                $.ajax({
                    crossDomain:"true",
                    type:"POST",
                    url: url,
                    data :  data,
                    cache: false,
                    timeout: 50000,
                    contentType :"application/json",
                    success: function(response){ 
                        console.log(response);
                   
                    },
                    error: function(jqXHR, textStatus, errorThrown) {
                    
                        console.log('error ' + textStatus + " " + errorThrown);
                    }
                });
            }

            document.getElementById("EditScreen").style.zIndex = 0;
            document.getElementById("EditScreen").style.display = "none";
        }

        $scope.model.selectedNodeData = null;
        $scope.saveFlowChart = function () {

            var myGuid = GUID();
            GUID.register(myGuid);
            var data = JSON.parse($scope.model.toJson());
            var flowchartID = "flowChartID"
            data[flowchartID] = myGuid;
            var flowchartName = "flowchartName"
            data[flowchartName] = $("#txtFileName").val();

            $http({
                method: 'POST',
                url: config.baseUrl + 'addFlowchart',
                data: data,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            }).then(function successCallback(response) {
                $scope.employees = response.data;
                alert(JSON.stringify($scope.employees));
            }, function errorCallback(response) {
                console.log(response.statusText);
            });
        }

        $scope.UpdateFlowChart = function () {
            var flowID = $scope.itemSelected.flowChartID
            var data = JSON.parse($scope.model.toJson());
            var flowchartID = "flowChartID"
            data[flowchartID] = flowID;
            var flowchartName = "flowchartName"
            data[flowchartName] = $scope.itemSelected.flowchartName;

            $http({
                method: 'POST',
                url: config.baseUrl + 'updateFlowchartByID',
                data: data,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            }).then(function successCallback(response) {
                $scope.employees = response.data;
                alert(JSON.stringify($scope.employees));
            }, function errorCallback(response) {
                console.log(response.statusText);
            });


        }


        $scope.UploadFile = function () {

            insertFile(document.getElementById("fileUpload").files[0], function (response) {
                var fileUnID = GUID();
                GUID.register(fileUnID);

                returnResult.assets.push({ fileID: fileUnID, assetType: response.mimeType, assetName: response.name, assetURL: response.id });
                document.getElementById("fileUpload").value = "";


                var Key = document.getElementById('spnKey');
                var jsondata = $scope.model.toJson();
                var data = JSON.parse(jsondata);  //parse the JSON
                var resStr;

                var OrderCount = 0;
                $.each(data.nodeDataArray, function (i, el) {
                    var newdata;
                    if (this.key === parseInt(Key.innerHTML)) {
                        if (!this.assets) {
                            this.assets = [];
                            OrderCount = 0;
                        }
                        else
                            OrderCount = this.assets.length;
                        this.assets.push({ fileID: fileUnID, assetType: response.mimeType, assetName: response.name, assetURL: response.id, Order: OrderCount });
                        resStr = JSON.stringify(data);

                    }
                });
                $scope.model = go.Model.fromJson(data);
                $scope.model.setDataProperty('lastModified', (new Date()).toString());
                // document.getElementById("mySavedModel").value = myDiagram.model.toJson();
                console.log(JSON.stringify(data));
                notifySuccess();



                loadImages();
                //loadImagesAsList();
            });

        }
        $scope.SelectFile = function () {
            // printFile($('#ddlJsonList').val(),$scope);
        }

        $scope.LoadFile = function () {
            listFiles($scope);
        }
        $scope.ddlValueChanged = function () {
            if ($scope.itemSelected) {
                var floID = $scope.itemSelected.flowChartID;

                $http({
                    method: 'GET',
                    url: config.baseUrl + 'getFlowChartByID/' + floID,
                    data: '',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    }
                }).then(function successCallback(response) {

                    $scope.model = go.Model.fromJson(response.data.Flowchart[0]);

                }, function errorCallback(response) {
                    console.log(response.statusText);
                });
            }

        }
        $scope.updateJSONData = function () {

            var indexOrder = [];
            $('#ListView div ').each(function (i) {
                var eachdivindex = $(this).index();
                var filename = $(this).attr('id');
                indexOrder.push({ assetURL: filename, Order: eachdivindex });
            });
            var jsonValforOrder = JSON.stringify(indexOrder);
            $scope.funcMergeJson(jsonValforOrder);
            //console.log(json);
        }
        $scope.funcMergeJson = function (fileorders) {
            var jsonData = $scope.model.toJson();

            var data = JSON.parse(jsonData);
            var orderData = JSON.parse(fileorders);
            //var Count = Object.keys(fileorders).length;
            for (var iL = 0; iL < data.nodeDataArray.length; iL++) {
                var item = data.nodeDataArray[iL];
                if (item.key == $scope.blkid) {
                    if (item.assets) {
                        for (var jL = 0; jL < item.assets.length; jL++) {
                            for (var kL = 0; kL < orderData.length; kL++) {
                                if (item.assets[jL].assetURL == orderData[kL].assetURL) {
                                    item.assets[jL].Order = orderData[kL].Order;
                                    break;
                                }
                            }
                        }
                        returnResult.assets = item.assets;
                        break;
                    }
                }
            }
            var FinalData = JSON.stringify(data);
            $scope.model = go.Model.fromJson(FinalData);
            console.log($scope.model);
        }
    });

//angular.element(document).ready(function(){
//     listFiles();
//})
//$scope.listFiles = ();

function showPorts(node, show) {
    var diagram = node.diagram;
    if (!diagram || diagram.isReadOnly || !diagram.allowLink) return;
    node.ports.each(function (port) {
        port.stroke = (show ? "white" : null);
    });
}

function closepopup() {
    var span = document.getElementsByClassName("close")[0];
    var modal = document.getElementById('myModal');
    modal.style.display = "none";
}
function notifySuccess() {
    PNotify.removeAll();
    new PNotify({
        title: 'Success!',
        text: 'That thing that you were trying to do worked.',
        type: 'success',
        delay: 2500,
    });
}

function notifyUSFailure() {
    PNotify.removeAll();
    new PNotify({
        title: 'No Images found!',
        text: 'No usability images found for this block.',
        type: 'info',
        delay: 2500
    });
}


function openUpload() {
    $(".smallUploadBox").show('fast');
}
function CanceluploadFile() {
    $(".smallUploadBox").hide('fast');
}

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
    // loadImagesAsList();
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
        //listFiles();
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
        var divString = "<section class='regular slider '>";

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
                    divString += " <div><img id='" + values.assetURL + "' height='50' width='50' src='" + base64 + "' data-darkbox='" + base64 + "'data-darkbox-group='one'></div>";
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

                checkXHRAvailable();
                await sleep(5000);
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

function listFiles($scope) {  
    if ($('#ddlJsonList').css('display') == 'block') {
        $http({
            method: 'GET',
            url: config.baseUrl + 'getAllFlowChartNames',
            data: data,
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        }).then(function successCallback(response) {
            $scope.FlowchartName = response.data;
            alert(JSON.stringify($scope.employees));
        }, function errorCallback(response) {
            console.log(response.statusText);
        });

    }
    else {

    }
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
function printFile(fileId, $scope) {
    var accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://www.googleapis.com/drive/v3/files/" + fileId + '?alt=media', true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xhr.responseType = 'text';
    xhr.onload = function () {
        var jsonFile = xhr.response;
        var jsondata = JSON.parse(xhr.response);
        // $("#mySavedModel").val(jsondata);
        $scope.model.diagram = go.Model.fromJson(jsondata);
    }
    xhr.send();
}
// To load the list of files
var divStringIL;
function loadImagesAsList() {
    $('#uploadFile').hide();
    $('#details').show();
    var bool = false;
    divStringIL = "";

    returnResult.assets.sort(function (a, b) {
        return a.Order - b.Order;
    });

    if (returnResult.assets && returnResult.assets.length > 0) {
        PNotify.removeAll();
        var accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;

        for (var iLoop = 0; iLoop < returnResult.assets.length; iLoop++) {
            var values = returnResult.assets[iLoop];

            if (values.assetType.indexOf("image") >= 0) {
                var vClass = "";

                bool = true;
                values.visited = true;
                var fileId = values.fileID;

                divStringIL += " <div id='" + values.assetURL + "'style='border: 1px solid;margin: 5px;width: 48%;background-color: lavender;font-weight: bold;text-align: center;'>" + values.assetName + "</div>";
                //requestXHRLI("https://www.googleapis.com/drive/v3/files/" + fileId + '?alt=media', accessToken, values.assetURL);
            }

        }

        var viewList = document.getElementById("ListView");
        divStringIL += "</div>";
        viewList.innerHTML = divStringIL;
    }
    else
        notifyUSFailure();
}

var xmlHttpReqQueueIL = new Array();
function requestXHRLI(url, accessToken, assetURL) {
    var xmlHttpReq;

    xmlHttpReq = new XMLHttpRequest()
    xmlHttpReq.onload = function () {
        xmlHttpReqQueueIL.shift();

        var base64 = 'data:image/png;base64,' + base64ArrayBuffer(xmlHttpReq.response);

        divStringIL += " <div><img id='" + assetURL + "' height='50' width='50' src='" + base64 + "'></div><br/>";

        if (xmlHttpReqQueueIL.length > 0)
            xmlHttpReqQueueIL[0].send(null);
        else {
            var viewList = document.getElementById("ListView");
            divStringIL += "</div>";
            viewList.innerHTML = divStringIL;
        }
    }

    xmlHttpReq.open('GET', url, true);
    xmlHttpReq.setRequestHeader('Authorization', 'Bearer ' + accessToken);
    xmlHttpReq.responseType = 'arraybuffer';
    xmlHttpReqQueueIL.push(xmlHttpReq);

    if (xmlHttpReqQueueIL.length == 1) {
        xmlHttpReq.send(null);
    }
}


function ShowDivs() {
    $('#uploadFile').show();
    $('#details').hide();
}

