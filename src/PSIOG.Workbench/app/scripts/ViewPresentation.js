var count, str = new Array(), order = new Array();
var coordinates = [], filename = [];
var xcp = new Array(), ycp = new Array();
var item;
var tips = new Array(); var mark = new Array();
var itemlength, cordlength;
var pptFooterText = 'WorkBench Ⓒ Psiog Digital';

function getMyData(imageData) {
    ResetVPSContext();

    var width = window.innerWidth;
    var height = window.innerHeight;
    itemlength = imageData.coOrdinates.length;
    for (var i = 0; i < itemlength; i++) {
        filename.push(imageData.coOrdinates[i].fileId);
        coordinates.push(imageData.coOrdinates[i].coOrds);

    }

    for (var i = 0; i < itemlength; i++) {

        xcp[i] = new Array();
        ycp[i] = new Array();
        order[i] = new Array();
        str[i] = new Array();
        for (var j = 0; j < coordinates[i].length; j++) {

            xcp[i][j] = coordinates[i][j].XCP * width / 100;
            ycp[i][j] = coordinates[i][j].YCP * height / 100;
            order[i][j] = coordinates[i][j].order;
            str[i][j] = coordinates[i][j].message;

        }
    }

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
    var currentSlide, captionList;

    //Frame a master and title slide
    var pptMaster = {
        masterSLide: {
            bkgd: 'FAD7A0',
            objects: [
              { 'line': { x: '2%', y: '10%', w: '96%', line: '0088CC', line_size: 1 } },
              { 'rect': { x: '2%', y: '13%', w: '23%', h: '83%', fill: 'F1F1F1' } },
              { 'text': { text: x, options: { font_face: 'Calibri', align: 'c', x: '10%', y: '3%', w: '80%', h: '5%', font_size : 18 } } },
              { 'text': { text: pptFooterText, options: { font_face: 'Calibri', align: 'r', x: '70%', y: '95%', w: '25%', h: '5%', font_size : 12 } } },
            ],
            slideNumber: { x: '95%', y: '93%', border: { pt: '0', color: 'FAD7A0' }}
        },
        titleSlide: {
            bkgd: 'FAD7A0',
            objects: [
              { 'text': { text: 'WorkBench - CrewLink', options: { x: '25%', y: '40%', w: '50%', h: '20%', font_face: 'Calibri', font_size: 32, align : 'c' } } },
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
        pptx.save("workBenchPresentation" + x);
    }

    document.getElementById("darkbox").append(btn);

    for (var i = 0; i < imgList.imageList.length; i++) {
        captionList = [];
        currentSlide = pptx.addNewSlide(pptMaster.masterSLide);

        for (var j = 0; j < coordinates[i].length; j++) {
            var x1 = inPercent(28 + (coordinates[i][j].XCP * 0.7));
            var y1 = inPercent(19 + (coordinates[i][j].YCP * 0.7));
            currentSlide.addText(order[i][j], { shape: pptx.shapes.OVAL, align: 'c', x: x1, y: y1, w: '2%', h: '3%', fill: 'F4D03F', line: '000000', line_size: 0.5, font_face: 'Calibri', font_size: 10 });
            captionList.push({ text: str[i][j], options: { bullet: { type: 'number'}, color: 'ABABAB', font_face: 'Calibri', font_size: 11 } });
        }

        currentSlide.addImage({ x: '27%', y: '17%', w: '70%', h: '70%', data: imgList.imageList[i].sourceString });
        currentSlide.addText(
            captionList, { x: '3%', y: '14%', w: '20%', h: 1.4, color: 'ABABAB', margin: 1 }
        );
    }
}

function inPercent(input) {
    return input + '%';
}

function removebtn() {
    $("#download").remove();
}

function AnimateListVPJS() {	//  Add tooltips to screen
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
        mark[j].style.top = (ycp[pos][j]) + 'px';
        mark[j].style.left = (xcp[pos][j] + 5) + 'px';
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
