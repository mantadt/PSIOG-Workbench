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
$(document).ready(function () {
    
    ImgListen.addEventListener('mousedown', handler);
    
});
 
if (ImgListen.classList.contains('show'))
{

}

function saveList()
{

    for (var i = 0; i < count; i++) {
        // store messages and coordinates in json

        var xcx = xcord[i] * 100 / window.innerWidth;
        var ycy = ycord[i] * 100 / window.innerHeight;
        var cords = { "FileID": imgs[i], "XCP": xcx, "YCP": ycy, "xc": xcord[i], "yc": ycord[i], "order": i + 1, "message": str[i] };
        coordinates.push(cords);
    }
   // var item = sendtoDB();
    //var url = 'http://192.168.10.132:1337/addCoordinates';
    //   console.log(item);
    //    $.ajax({
    //                crossDomain:"true",
    //                type:"POST",
    //                url: url,
    //                data :  item,
    //                cache: false,
    //                timeout: 50000,
    //                contentType :"application/json",
    //                 success: function(response){ 
    //                      console.log(response);
    //                      checkDB = true;
    //                },
    //                 error: function(jqXHR, textStatus, errorThrown) {
    //                        checkDB = false;
    //                        console.log('error ' + textStatus + " " + errorThrown);
    //                }
    //        });
              
       document.getElementById("clear").disabled = true;
       document.getElementById("anim").disabled=true;
       ClearList();
   	   
}


function storeMessage(message, x, y, imageID) {
   
    // store messages in array and display it in side screen
   var liEntry = message ;
   xcord.push(x); ycord.push(y); str.push(message); imgs.push(imageID);
   var checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.name = "message";
    checkbox.value = message ;
    checkbox.id = "box"+boxcount;

    var label = document.createElement('label');
    label.id = "label"+boxcount;
    label.htmlFor = "box"+boxcount;
    label.appendChild(document.createTextNode(liEntry));
   
    list.appendChild(checkbox);
    list.appendChild(label);
    label.appendChild(document.createElement('br'));
     var x= "box"+boxcount; var y= "label"+boxcount;
    document.getElementById(x).className = "box";
    document.getElementById(y).className = "text";
    count++;
   boxcount++;
    
}

function getMousePos(evt) {
    var offset = $("#darkbox").offset();
    // get coordinates wrt canvas and screen
    return {
        x: evt.pageX - offset.left,
        y: evt.pageY - offset.top
    };
   
}
      
var handler = function (evt) {
    document.getElementById("EditScreen").style.zIndex = 999999;
    document.getElementById("EditScreen").style.display ="block";
    imageID = ImgListen.getAttribute("data-title");
    //alert(imageID);
    //get message from input for each coordinates
     var mousePos = getMousePos(evt);
     var message = prompt("Enter tooltip text:"); 
     if(message!=null)
     {
        if(message.length != 0)
        {
            storeMessage(message,mousePos.x ,mousePos.y, imageID);
            document.getElementById("clear").disabled=false;
            document.getElementById("anim").disabled=false;
        }  
     }
}
    


function EditList(){
    // remove checked entry
  var boxes = document.getElementsByClassName('box');
  var texts = document.getElementsByClassName('text');
  var len = boxes.length;
  console.log(len+","+boxcount);
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
    
}

function AnimateList()
{	//  Add tooltips to screen
    var y= []; var z=[];
	for(var i =0; i<count;i++)
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
	      tips[i].style.left = (xcord[i]+15)+'px'; 
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
    }
   
   document.getElementById("anim").disabled=true;   
   
   setTimeout(RemoveAnimate, 4000); 
}
function mouseOut(event){
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
}

function RemoveAnimate()
{	//  Remove tooltips added	
	for(var i =0; i<count;i++)
    {
	      var id1 = "tip"+i;
          var id2 = "mark"+i;
          if(id1 !=null && id2 !=null)
          {
              var op1= document.getElementById(id1);
              op1.parentNode.removeChild(op1);
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
	count=0;
	}



   
   