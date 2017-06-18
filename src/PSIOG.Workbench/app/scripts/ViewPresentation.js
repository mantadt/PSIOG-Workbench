var count, xcord = new Array(), ycord = new Array(), str = new Array(), order = new Array();
var coordinates = [], filename = [];
var xcp = new Array(), ycp = new Array();
var item;
var tips = new Array(); var mark = new Array();
var itemlength, cordlength;

function getMyData(imageData) {
    var width = window.innerWidth;
    var height = window.innerHeight;
    itemlength = imageData.coOrdinates.length;
    for (var i = 0; i < itemlength; i++) {
        filename.push(imageData.coOrdinates[i].fileId);
        coordinates.push(imageData.coOrdinates[i].coOrds);

    }

    for (var i = 0; i < itemlength; i++) {
        xcord[i] = new Array();
        ycord[i] = new Array();
        xcp[i] = new Array();
        ycp[i] = new Array();
        order[i] = new Array();
        str[i] = new Array();
        for (var j = 0; j < coordinates[i].length; j++) {
            xcord[i][j] = coordinates[i][j].xc;
            ycord[i][j] = coordinates[i][j].yc;
            xcp[i][j] = coordinates[i][j].XCP * width / 100;
            ycp[i][j] = coordinates[i][j].YCP * height / 100;
            order[i][j] = coordinates[i][j].order;
            str[i][j] = coordinates[i][j].message;

        }
    }

}

//document.getElementById("darkbox").onclick = AnimateList();

function ShowHide() {
    AnimateListVPJS();

}

function AnimateListVPJS() {	//  Add tooltips to screen
    $("div.oldMarksVPS").tooltip('destroy');
    $("div.oldMarksVPS").remove();
    var id = document.getElementById("darkbox");
    // if(id.className =="show")
    // var viewImageID = id.getAttribute("data-title");

    var len, pos;
    // for (var i = 0; i < itemlength; i++) {
    //    if (viewImageID = filename[i]) {
    //       console.log(viewImageID + ":::" + filename[i]);
    pos = id.getAttribute("myID");
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
