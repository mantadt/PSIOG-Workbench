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
   
    for (var i = 0; i < itemlength ; i++) {
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
       AnimateList();
       
}

function AnimateList() {	//  Add tooltips to screen
    
    var id = document.getElementById("darkbox");
   // if(id.className =="show")
     // var viewImageID = id.getAttribute("data-title");

    var len, pos;
   // for (var i = 0; i < itemlength; i++) {
    //    if (viewImageID = filename[i]) {
     //       console.log(viewImageID + ":::" + filename[i]);
        pos = id.getAttribute("myID");
         len = coordinates[pos].length;
           
     //   }
   // }
    for (var j = 0; j < len ; j++) {
        tips[j] = document.createElement('div');
        mark[j] = document.createElement('div');
        tips[j].id = 'tips' + j;
        mark[j].id = 'mark' + j;
        tips[j].style.position = 'absolute';
        mark[j].style.position = 'absolute';
        mark[j].style.width = '15px';
        tips[j].style.border = '1px solid blue';
        mark[j].style.border = '1px solid black';
        tips[j].style.padding = '5px';
        tips[j].style.background = "white";
        tips[j].style.color = 'black';
        mark[j].style.color = 'black';
        mark[j].style.background = "lawngreen";
       tips[j].style.display = 'none';
        mark[j].style.textAlign = "center";
        mark[j].style.borderRadius = "50%";
        tips[j].style.top = (ycp[pos][j]) + 'px';
        tips[j].style.left = (xcp[pos][j] + 25) + 'px';
        mark[j].style.top = (ycp[pos][j]) + 'px';
        mark[j].style.left = (xcp[pos][j] + 5) + 'px';
        /* tips[j].style.top = (ycord[i][j] -10)+'px';
	      tips[j].style.left =(xcord[i][j] +25)+'px';
	      mark[j].style.top = (ycord[i][j]-10)+'px';
          mark[j].style.left = (xcord[i][j]+10)+'px';*/
        mark[j].innerHTML = j + 1;
        tips[j].innerHTML = str[pos][j];
        document.getElementById("darkbox").appendChild(tips[j]);
        document.getElementById("darkbox").appendChild(mark[j]);
        mark[j].onmouseout = function () { mouseOut(event); }
        mark[j].onmouseover = function () { mouseOver(event); }

    }
  //  setTimeout(RemoveAnimate, 3000);
   setTimeout(function () { RemoveAnimate(len); }, 5000);
}
function mouseOut(event) {
    var id1 = event.currentTarget.id;
    console.log(id1);
    var id2 = "tips" + id1.substring(4);
    if (id2 != null) {
        document.getElementById(id2).style.display = 'none';
    }
}

function mouseOver(event) {
    var id1 = event.currentTarget.id;
    console.log(id1);
    var id2 = "tips" + id1.substring(4);
    if (id2 != null) {
        document.getElementById(id2).style.display = "block";
    }
}


function RemoveAnimate(len) {	//  Remove tooltips added
    //var id = document.getElementById("darkbox");
    //var viewImageID = id.getAttribute("data-title");
    //var len;
    //for (var i = 0; i < itemlength; i++) {
    //    if (viewImageID = filename[i])
    //        len = coordinates[i].length;
    //}
    for (var j = 0; j < len; j++) {
        var id1 = "tips" + j;
        var id2 = "mark" + j;

        if (id1 != null && id2 != null) {
            var op1 = document.getElementById(id1);
            op1.parentNode.removeChild(op1);
            var op2 = document.getElementById(id2);
            op2.parentNode.removeChild(op2);
        }
    }
    
}
