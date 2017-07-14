var count, str = new Array(), order = new Array();
var coordinates = [], filename = [];
var xcp = new Array(), ycp = new Array();
var item;
var tips = new Array(); var mark = new Array();
var itemlength, cordlength;

var pptFooterText = 'WorkBench Ⓒ Psiog Digital';
//To Do : Refactor storing slide data by grouping everything into the slide set. Attach everything as properties inside Json
var slideSet = [];

function getMyData(imageData) {
    //console.log(imageData);
    ResetVPSContext();

    var width = window.innerWidth;
    var height = window.innerHeight;
    itemlength = imageData.coOrdinates.length;
     
    //To do : Find a way to merge both loops into one after setting up slideSet
    for (var i = 0; i < itemlength; i++) {
        filename.push(imageData.coOrdinates[i].fileId);
        coordinates.push(imageData.coOrdinates[i].coOrds);
        slideSet.push({ description: imageData.coOrdinates[i].stepDescription });
    }

    for (var i = 0; i < itemlength; i++) {
        xcp[i] = new Array();
        ycp[i] = new Array();
        order[i] = new Array();
        str[i] = new Array();
        for (var j = 0; j < coordinates[i].length; j++) {
            xcp[i][j] = coordinates[i][j].XCP;
            ycp[i][j] = coordinates[i][j].YCP;
            order[i][j] = coordinates[i][j].order;
            str[i][j] = coordinates[i][j].message;
        }
    }
    //console.log(xcp);
}

function ResetVPSContext() {
    xcord = new Array(), ycord = new Array(), str = new Array(), order = new Array();
    coordinates = [], filename = [];
    xcp = new Array(), ycp = new Array();
    mark = new Array();
}

//document.getElementById("darkbox").onclick = AnimateList();

function ShowHide() {
    AnimateListVPJS();
}

function savePpt(imgList, x) {
    var currentSlide, appendix;

    //Frame a master and title slide
    var pptMaster = {
        masterSLide: {
            bkgd: 'FAD7A0',
            objects: [
              { 'line': { x: '2%', y: '10%', w: '96%', line: '0088CC', line_size: 1 } },
              { 'rect': { x: '2%', y: '13%', w: '23%', h: '83%', fill: 'F1F1F1' } },
              { 'text': { text: x, options: { font_face: 'Calibri', align: 'l', x: '2%', y: '3%', w: '30%', h: '5%', font_size: 18 } } },
              { 'text': { text: pptFooterText, options: { font_face: 'Calibri', align: 'r', x: '70%', y: '95%', w: '25%', h: '5%', font_size: 12 } } },
            ],
            slideNumber: { x: '95%', y: '93%', border: { pt: '0', color: 'FAD7A0' } }
        },
        titleSlide: {
            bkgd: 'FAD7A0',
            objects: [
                //To do : Do not hardcode 'CrewLink' here. Register a project name, module name, flow name while creating a flow and use them here
              { 'text': { text: 'WorkBench - CrewLink', options: { x: '25%', y: '30%', w: '50%', h: '10%', font_face: 'Calibri', font_size: 32, align: 'c' } } },
              { 'text': { text: x, options: { x: '25%', y: '50%', w: '50%', h: '10%', font_face: 'Calibri', font_size: 26, align: 'c' } } },
              { 'text': { text: pptFooterText, options: { font_face: 'Calibri', align: 'r', x: '70%', y: '95%', w: '25%', h: '5%', font_size: 12 } } },
            ]
        }
    };

    //Create a new PPT
    var pptx = new PptxGenJS();
    pptx.setLayout('LAYOUT_16x9');
    pptx.addNewSlide(pptMaster.titleSlide);

    var btn = document.createElement("BUTTON");
    btn.id = "download"
    btn.className = "btn-primary PPTDownload";
    var t = document.createTextNode("DOWNLOAD");
    btn.appendChild(t);

    btn.onclick = function () {
        $(this).remove();
        pptx.save("workBench_" + x);
    }

    document.getElementById("darkbox").append(btn);

    for (var i = 0; i < imgList.imageList.length; i++) {
        appendix = [];
        currentSlide = pptx.addNewSlide(pptMaster.masterSLide);
        currentSlide.addImage({ x: '27%', y: '17%', w: '70%', h: '70%', data: imgList.imageList[i].sourceString });

        for (var j = 0; j < coordinates[i].length; j++) {
            var x1 = inPercent(27 + (coordinates[i][j].XCP * 0.7));
            var y1 = inPercent(17 + (coordinates[i][j].YCP * 0.7));
            currentSlide.addText(order[i][j], { shape: pptx.shapes.OVAL, align: 'c', x: x1, y: y1, w: '2%', h: '3%', fill: 'F4D03F', line: '000000', line_size: 0.5, font_face: 'Calibri', font_size: 10 });
            appendix.push({ text: str[i][j], options: { bullet: { type: 'number' }, color: 'ABABAB', font_face: 'Calibri', font_size: 11 } });
        }

        currentSlide.addText(
            appendix, { x: '3%', y: '14%', w: '20%', h: 1.4, color: 'ABABAB', margin: 1 }
        );
        //Add the stepDescription for that Node to the Header of the slide     
        currentSlide.addText(slideSet[i].description, { font_face: 'Calibri', align: 'r', x: '35%', y: '3%', w: '63%', h: '5%', font_size: 18 });
    }
}

function inPercent(input) {
    return input + '%';
}

function removebtn() {
    $("#download").remove();
}

function AnimateListVPJS() {	//  Add tooltips to screen
    //Obtain the dimensions of the Darkbox and its background image
    var darkBoxElement = document.getElementById('darkbox');
    var backgroundImage = new Image();
    backgroundImage.src = darkBoxElement.style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2').split(',');
    //Correct image height and width if it is larger than the darkbox
    if (backgroundImage.height > darkBoxElement.clientHeight) {
        backgroundImage.width = backgroundImage.width * (darkBoxElement.clientHeight / backgroundImage.height);
        backgroundImage.height = darkBoxElement.clientHeight;
    }
    $("div.oldMarksVPS").tooltip('destroy');
    $("div.oldMarksVPS").remove();
    var id = document.getElementById("darkbox");

    // if(id.className =="show")
    // var viewImageID = id.getAttribute("data-title");

    var len = 0, pos;
    // for (var i = 0; i < itemlength; i++) {
    //    if (viewImageID = filename[i]) {
    //       console.log(viewImageID + ":::" + filename[i]);
    pos = id.getAttribute("myID");

    if (coordinates[pos])
        len = coordinates[pos].length;

    var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });

    //   }
    // }
    for (var j = 0; j < len; j++) {
        mark[j] = document.createElement('div');
        mark[j].id = 'mark' + j;
        mark[j].style.position = 'absolute';
        mark[j].style.width = '15px';
        mark[j].style.border = '1px solid black';
        mark[j].style.color = 'black';
        mark[j].style.background = "lawngreen";
        mark[j].style.textAlign = "center";
        mark[j].style.borderRadius = "50%";
        //mark[j].style.top = (ycp[pos][j]) + 'px';
        mark[j].style.top = ((ycp[pos][j] * backgroundImage.height) / 100) + ((darkBoxElement.clientHeight - backgroundImage.height) / 2) + 'px';
        //mark[j].style.left = (xcp[pos][j] + 5) + 'px';
        mark[j].style.left = ((xcp[pos][j] * backgroundImage.width) / 100) + ((darkBoxElement.clientWidth - backgroundImage.width) / 2) + 'px';
        mark[j].innerHTML = j + 1;
        mark[j].dataToggle = 'tooltip';
        mark[j].title = str[pos][j];
        mark[j].className = 'oldMarksVPS c' + guid;
        document.getElementById("darkbox").appendChild(mark[j]);
    }

    $("div.oldMarksVPS").tooltip({ delay: { hide: 15000 }, placement: 'right' });
    $("div.oldMarksVPS").tooltip('show');
    setTimeout(function () { $("div.oldMarksVPS.c" + guid).tooltip('hide') }, 15000);
}
