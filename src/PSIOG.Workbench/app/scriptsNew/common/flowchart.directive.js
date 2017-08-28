angular.module('sbAdminApp')
    .directive('goDiagram', function (commonSvc, $compile, config) {
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
                        scope.blkid = e.subject.part.data.key;

                        if (scope.op == 1)
                            OpenPopup(e.subject.part.data);
                        else {
                            CreateCarousel(e.subject.part.data);
                        }
                    });

                function CreateCarousel(val) {
                    var blockId = val.key;
                    var flowchartId = scope.$parent.itemSelected.flowChartID;
                    var imagesC = [];

                    jQuery.blockUI();

                    commonSvc.getFlowchartByFlowIdBlockId(flowchartId, blockId).then(function successCallback(response) {
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
                    else {
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