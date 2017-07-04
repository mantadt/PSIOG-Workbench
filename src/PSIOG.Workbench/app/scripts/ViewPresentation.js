var count, str = new Array(), order = new Array();
var coordinates = [], filename = [];
var xcp = new Array(), ycp = new Array();
var item;
var tips = new Array(); var mark = new Array();
var itemlength, cordlength;

function getMyData(imageData) {
    xcord = new Array(), ycord = new Array(), str = new Array(), order = new Array();
    coordinates = [], filename = [];
    xcp = new Array(), ycp = new Array();
    mark = new Array();

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

//document.getElementById("darkbox").onclick = AnimateList();

function ShowHide() {
    AnimateListVPJS();

}

function savePpt(imgList, x) {
    var pptx = new PptxGenJS();
    var slide= new Array();
    var btn = document.createElement("BUTTON");
    btn.id = "download"
    btn.className = "btn-primary PPTDownload";
    var t = document.createTextNode("DOWNLOAD");      
    btn.appendChild(t);
    btn.onclick = function () {
          $(this).remove();
           pptx.save("Presentation" + x);
           //removebtn();
          

    }
     document.getElementById("darkbox").append(btn);
    for (var i = 0; i < imgList.imageList.length; i++)
    {
       
       
             slide[i] = pptx.addNewSlide();
             slide[i].addImage({ x: 0, y: 0, w: '100%', h: '100%', data: imgList.imageList[i].sourceString });
             for(var j = 0 ; j< coordinates[i].length ; j++)
            {
                var x1 = coordinates[i][j].XCP+ "%";
                var y1 = coordinates[i][j].YCP + 5 + "%";
                var x2 = coordinates[i][j].XCP+2 + "%";
                var y2 = coordinates[i][j].YCP + 3 + "%";
                slide[i].addText(order[i][j], { shape: pptx.shapes.OVAL, align: 'c', x: x1, y: y1, w: '2%', h: '3%', fill: '40b840', line: '000000', line_size: 0.5, font_size: 10 }
                  );
                  slide[i].addText(str[i][j], { x: x2, y: y2, font_size: 12 }
                     );
            }
           
        //  }
            
    }

   
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
