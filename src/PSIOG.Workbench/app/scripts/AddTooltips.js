var count = 0, xcord = [], ycord = [], str=[];;    
var coordinates = [];
var img; 
var item;
var tips=[]; var mark=[];
var boxcount = 0;
var checkDB = false;
var ImgListen = document.getElementById("darkbox");
var flowchartID;
var blockID;
var imgs = [];
var imageID;
var finalCords = [];


$(document).ready(function () {

       ImgListen.addEventListener('mousedown', handleClick);
});


function handleClick(event) {
    document.getElementById("EditScreen").style.zIndex = 999999;
    document.getElementById("EditScreen").style.display = "block";
    imageID = ImgListen.getAttribute("data-title");
   // var offset = $("#darkbox").offset;
    var x = event.clientX - 24;//- offset.left;
    var y = event.clientY - 24;// - offset.top;
    console.log(x+ "'"+y);
    var message = prompt("Enter tooltip text:");
    if (message != null) {
        if (message.length != 0) {
            storeMessage(message, x, y, imageID);
            document.getElementById("clear").disabled = false;
            document.getElementById("downloadbtn").disabled = false;
            document.getElementById("anim").disabled = false;
        }
    }
}

function saveList()
{
   
    for (var i = 0; i < count; i++) {
        // store messages and coordinates in json
        var xcx = xcord[i] * 100 / window.innerWidth;
        var ycy = ycord[i] * 100 / window.innerHeight;
        var cords = { "XCP": xcx, "YCP": ycy, "xc": xcord[i], "yc": ycord[i], "order": i + 1, "message": str[i] };
        coordinates.push(cords);
    }
    finalCords.push({ "ImageID": imageID, "coordinates": coordinates });
    coordinates = [];
    //console.log(finalCords);
    document.getElementById("clear").disabled = true;
    document.getElementById("anim").disabled = true;
    document.getElementById("EditScreen").style.zIndex = 0;
    document.getElementById("EditScreen").style.display = "none";
    ClearList();
   	   
}


function storeMessage(message, x, y, imageID) {
   
    // store messages in array and display it in side screen
   var list = document.getElementById("list");
   var liEntry = message ;
   xcord.push(x); ycord.push(y); str.push(message); imgs.push(imageID);
   var newLI = document.createElement('li');
   var checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.name = "message";
    checkbox.value = message ;
    checkbox.id = "box"+boxcount;

    var label = document.createElement('label');
    label.id = "label"+boxcount;
    label.htmlFor = "box"+boxcount;
    label.appendChild(document.createTextNode(liEntry));

    newLI.appendChild(checkbox);
    newLI.appendChild(label);
    list.appendChild(newLI);
     var x= "box"+boxcount; var y= "label"+boxcount;
    document.getElementById(x).className = "box";
    document.getElementById(y).className = "text";
    count++;
   boxcount++;
    
}

/*function getMousePos(evt) {
    // get coordinates wrt canvas and screen
    return {
        x: evt.clientX,
        y: evt.clientY 
    };
}*/
      
/*function getCords(event) {
    //get message from input for each coordinates
    
}
function getMousePos(event) {
   
     var offset = $("#darkbox").offset();
    console.log(event.ClientX + ",," + event.ClientY);
    console.log(offset.top + "," + offset.left);
    // get coordinates wrt canvas and screen
    var x = event.ClientX - offset.left;
    var y = event.ClientY - offset.top;
    
    var message = prompt("Enter tooltip text:");
    if (message != null) {
        if (message.length != 0) {
            storeMessage(message, x,y, imageID);
            document.getElementById("clear").disabled = false;
            document.getElementById("anim").disabled = false;
        }
    }
   
}
      
//var handler = 
    
    */

function EditList(){
    // remove checked entry
  var boxes = document.getElementsByClassName('box');
  var texts = document.getElementsByClassName('text');
  var len = boxes.length;
  console.log(boxcount);
    for(var i = 0; i<boxcount; i++){
         box = boxes[i];
         txt = texts[i];
         if(box!=null && box.checked){
            box.parentNode.removeChild(box);
            txt.parentNode.removeChild(txt);
            xcord.splice(i,1);
            ycord.splice(i,1); 
            str.splice(i, 1);
            imgs.splice(i, 1);
            count--;
         }
    }
    var list = document.getElementById("list");
    list.innerHTML = list.replace("<br><br>", "<br>")
    
}

function AnimateList()
{	//  Add tooltips to screen
    $("div.oldMarksVPS").tooltip('destroy');
    $("div.oldMarksVPS").remove();
    var guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });

    var y= []; var z=[];
	/*for(var i =0; i<count;i++)
    {
	      tips[i]=  document.createElement('div');
          mark[i]=  document.createElement('div');
          tips[i].id = 'tip'+i;
          mark[i].id = 'mark'+i;
          tips[i].style.position = 'absolute';
          mark[i].style.position = 'absolute';
          mark[i].style.width = '15px';
	      tips[i].style.border = '1px solid blue';
          mark[i].style.border = '1px solid black';
	      tips[i].style.padding = '5px';
	      tips[i].style.background = "white";
	      tips[i].style.color = 'black';
	      mark[i].style.color = 'black';
          mark[i].style.background ="lawngreen";
	      tips[i].style.display = 'none';
          mark[i].style.textAlign = "center";
          mark[i].style.borderRadius = "50%";
	      tips[i].style.top = (ycord[i])+'px';
	      tips[i].style.left = (xcord[i]+25)+'px'; 
	      mark[i].style.top = (ycord[i])+'px';
          mark[i].style.left = (xcord[i]+5)+'px'; 
                    mark[i].innerHTML = i+1;
                    tips[i].innerHTML = str[i];
                    
          document.getElementById('darkbox').appendChild(tips[i]);
          document.getElementById('darkbox').appendChild(mark[i]);
         // document.getElementsByTagName('body')[0].appendChild(tips[i]);
        //  document.getElementsByTagName('body')[0].appendChild(mark[i]);
          mark[i].onmouseout  = function() {  mouseOut(event);}
          mark[i].onmouseover = function() { mouseOver(event);}
    }*/
    for (var j =0; j<count;j++) {
        mark[j] = document.createElement('div');
        mark[j].id = 'mark' + j;
        mark[j].style.position = 'absolute';
        mark[j].style.width = '15px';
        mark[j].style.border = '1px solid black';
        mark[j].style.color = 'black';
        mark[j].style.background = "lawngreen";
        mark[j].style.textAlign = "center";
        mark[j].style.borderRadius = "50%";
        mark[j].style.top = (ycord[j]) + 'px';
        mark[j].style.left = (xcord[j] + 5) + 'px';
        mark[j].innerHTML = j + 1;
        mark[j].dataToggle = 'tooltip';
        mark[j].title = str[j];
        mark[j].className = 'oldMarksVPS c' + guid;
        document.getElementById("darkbox").appendChild(mark[j]);
    }
    
    $("div.oldMarksVPS").tooltip({ delay: { hide: 2000 }, placement: 'right' });
    $("div.oldMarksVPS").tooltip('show');
    setTimeout(function () { $("div.oldMarksVPS.c" + guid).tooltip('hide') }, 2000);

    setTimeout(RemoveAnimate, 10000);
   document.getElementById("anim").disabled=true;   
   
}


/*function mouseOut(event){
    var id1 = event.currentTarget.id;
   var id2 = "tip"+id1.substring(4);
   
    if(id2 !=null)
    {
          document.getElementById(id2).style.display = 'none';
    }
}

function mouseOver(event){
   var id1 = event.currentTarget.id;
   var id2 = "tip"+id1.substring(4);
    if(id2 !=null)
    {
         document.getElementById(id2).style.display = "block";
    }
}*/

function RemoveAnimate()
{	//  Remove tooltips added	
    $("div.oldMarksVPS").tooltip('destroy');
    $("div.oldMarksVPS").remove();
	for(var i =0; i<count;i++)
    {
	    //  var id1 = "tip"+i;
          var id2 = "mark"+i;
	    //  if(id1 !=null && id2 !=null)
	      if(id2 !=null)
          {
           //   var op1= document.getElementById(id1);
           //   op1.parentNode.removeChild(op1);
              var op2= document.getElementById(id2);
              op2.parentNode.removeChild(op2);
          }
   }
    document.getElementById("anim").disabled=false; 
    
}

function ClearList()
{	
	var list = document.getElementById("list");
    while (list.hasChildNodes()) {
        list.removeChild(list.lastChild);
    }
	for(var i =0; i<=count;i++)
    {
	    xcord.pop(); ycord.pop(); str.pop();
	    imgs.pop();
	}
	count = 0; boxcount = 0;
}



   
   