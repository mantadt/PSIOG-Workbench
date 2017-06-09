/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var data = require('./public/javascripts/data.js');
var coordinates = require('./public/javascripts/ManageCoordinates.js');
var bodyParser     = require('body-parser');
var cors           = require('cors');
var router         = express.Router();
var convert = require('xml-js');


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());

app.use(express.bodyParser());
// configure the app to use bodyParser()
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

app.get('/products',data.getProducts);
app.post('/products',data.addProduct);
app.delete('/products/:id',data.deleteProduct);
app.put('/products/:id', data.updateProduct);
app.get('/CheckConnection', data.getConnectionStatus);

app.get('/getCoordinates', data.getCoordinates);
app.post('/addCoordinates', data.addCoordinates);
//app.delete('/deleteCoordinates', coordinates.deleteCoordinates);
//app.put('/updateCoordinates/:id', coordinates.updateCoordinates);

//Pass formData with key:xmlaData and value as the XML string
app.post('/generateFromXml',function (req, res){


	//console.log(req.body);
	//console.log(req.body.xmlData);
	var xmlc = req.body.xmlData;

	
	var a1 = generateButtonXml(xmlc);
	res.json({results: a1.results, nodes: a1.nodes, links: a1.links  });
	return res;

});

//Pass an object with parameters --> nodes[] and links[]
app.post('/generateFromJson',function (req, res){


	console.log(req.body);
	//console.log(req.body.xmlData);
	var jsonc = req.body;
	
	var a1 = generateButtonJson(jsonc);

	res.json({results: a1.results, nodes: a1.nodes, links: a1.links  });
	return res;

});







http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});





//App Logic

function checkForMoreNodes(idToCheck, nodes, links){
	      var moreNodes = false;
	      
	      var arr=[];
	      for(var i=0; i<links.length; i++)
	      {
	        if(links[i].from==idToCheck)
	          { moreNodes = true;
	            arr.push(links[i].id+"_"+links[i].to);
	          }
	      }
	      if(!moreNodes)
	        return false;
	      else
	        return arr;
	      }

function loopChecker(maintainer)
	       {

	        if(!maintainer)
	          return false;

	        //for(var i=0; i<maintainer.length; i++)
	        //{

	          var str = maintainer;
	          //Get the last digit/id
	          var idToCheck = str.substring(str.lastIndexOf("_")+1,str.length);
	          
	          //Count number of times the id appears
	          var chars = str.split(/[_]+/);

	          var n=0;
	          for(var k=0; k<chars.length; k++)
	          {
	            if(chars[k]==idToCheck)
	              n++;
	          }

	          if(n<=2) return false;

	          else{



	          //Store addresses of repetition inside an array
	          var idLocations = [];

	          if(str.slice(0, str.indexOf("_")) == idToCheck.toString())
	            idLocations.push(0);

	          
	          
	          for(var pos = str.indexOf("_"+idToCheck.toString()+"_"); pos !== -1; pos = str.indexOf("_"+idToCheck.toString()+"_", pos + 1)) {
	                 idLocations.push(pos+1);
	             }

	          //if( str.slice(str.lastIndexOf("_"), str.length-1) == idToCheck.toString() )
	          var stringlen = str.length;
	          idLocations.push(stringlen-2);
	          

	          ////console.log(matches);
	          // for(var j=1; j<=str.split(/[_]+/).length; j++)
	          // {
	          //   // if(str[j]==idToCheck)
	          //   //   idLocations.push(j);

	          //   if(str.slice(str.indexOf("_", j)+1, str.indexOf("_", j+1)) == idToCheck)
	          //     idLocations.push(str.indexOf("_", j)+1);

	          // }
	          //console.log(idLocations);
	          //Even case handling
	          var x = idLocations.length; 
	          for(var k=0; k<(idLocations.length/2); k++)
	            {

	              var s1 = str.slice(idLocations[x-2*(k+1)-1]+2, idLocations[x-(k+1)-1]-1);
	              var s2 = str.slice(idLocations[x-(k+1)-1]+2, idLocations[x-1]);

	              if(s1[s1.length-1]=="_")
	                s1 = s1.slice(0,s1.length-1);
	              if(s2[s2.length-1]=="_")
	                s2 = s2.slice(0,s2.length-1);

	              if(s1[0]=="_")
	                s1 = s1.slice(1,s1.length);
	              if(s2[0]=="_")
	                s2 = s2.slice(1,s2.length);
	              


	              if(s1==s2)
	                return true;

	              if(n%2==0)
	                return false;

	            }       

	        }
	        
	        return false;

	       }

function combinator(nodes, links)
           {

           console.log(loopChecker("2_4_3_7_6_20_3_7_6_20_3"));
            ////console.log("Done testing");
            var outputArray = [];
            
            var numberofcombos = 0;
            
            ////console.log( links);
            //Finding the primary node's ID
            var primaryid;
            for(var i=0; i<nodes.length;i++)
              if(nodes[i].primary=="P")
                {
                  primaryid = nodes[i].id;
                  //console.log("Reached here ");
                }
            ////console.log("Primaru node "+ primaryid);

           

            //Maintainer array
            var maintainer = [];
            maintainer.push(primaryid.toString());
            

            //Append first time combinations
            //for(var i=0;i<links.length;i++)
            //{
             // if(links[i].from==primaryid)

            //}


            //Scan through the links to find the primary links
            var globalexhausted=false;
            //r looper=0;

            var start = new Date().getTime();      
            //var elapsed = new Date().getTime() - start; && ((new Date().getTime() - start)<15000)
            
            while(!globalexhausted && ((new Date().getTime() - start)<2500) )
            {

            console.log("Maintainer",maintainer);
            console.log("Out", outputArray);
            //setTimeout( function(){}, 5000);

            if(maintainer.length==0)
                  break;
             
             var exhausted=true;
             var maintainerTemp = [];
             
             
             for(var i=0; i<maintainer.length; i++)
             {  
                idToCheck = maintainer[i].substring(maintainer[i].lastIndexOf("_")+1,maintainer[i].length);
                var check = checkForMoreNodes(idToCheck, nodes, links);
                ////console.log(check);

                

                

                

                if(!check)
                { 

                  //exhausted = true;
                  ////console.log()
                  outputArray.push(maintainer[i]);
                  //maintainer.splice(i, 1);
                  //i--;
                  ////console.log("When does it reach this");
                  
                }

                else
                {
                  
                  exhausted = false;
                  //Write logic to add appended values and remove the existing maintainer element
                  var temp = maintainer[i];
                  //maintainer.splice(i, 1);
                  for(var j=0; j<check.length; j++)
                  {
                    
                    maintainerTemp.push(temp+"_"+check[j]);

                    
                  }
                  
                }

                }



                
                

              
               

             
             ////console.log("exhausted?"+exhausted);
             globalexhausted = exhausted;

             //var onlyloopelements = true;
             var loopCheck1 = false; 
             if(maintainerTemp.length<1)
               break;

             for(var n=0; n<maintainerTemp.length; n++)
                {

                         
                var loopCheck1 = loopChecker(maintainerTemp[n]); 
                //console.log(loopCheck1);

                if(loopCheck1==true )
                    {
                      //exhausted = false;
                      //console.log("removing looped element froms tack "+maintainerTemp[n]);
                      maintainerTemp.splice(n, 1 );
                      //i--;
                    }


                    //else
                      //onlyloopelements = false;
              }

               



                
                

               // if(onlyloopelements)
                 // globalexhausted = true;

                maintainer = maintainerTemp;
              }


            


           return outputArray;
           ////console.log(links);
           
          
           }

function generateButtonJson(jsonc)
            {

             var nodes = jsonc.nodes;
             var links = jsonc.links;
             try{
             
                var outp = combinator(nodes, links);
                var obj = {results:outp, nodes:nodes, links:links};
                return obj;
              
             
             }
             catch(e)
             {
               
             }
         }

function generateButtonXml(xmlc)
                       {  
	                    try{
	                        var nodes = [];
	                        var links = [];
	                        
	                        

	                        //Passing on the XML content or JSON directly
	                        var xmlcontent = xmlc;
	                        //var jsoncontent = xmlToJSON.parseString(xmlcontent);
	                        //console.log(xmlcontent);
	                        
	                        var jsoncontent;
	                        jsoncontent = convert.xml2json(xmlcontent, {compact: true, spaces: 4});
	                        jsoncontent = JSON.parse(jsoncontent);
	                        //return jsoncontent;


	                        //console.log(typeof jsoncontent);
	                        var mxCell = jsoncontent.mxGraphModel.root.mxCell;
	                          

	                        console.log(mxCell[4].mxGeometry._attributes);
	                        edge=0; node=0;

	                        //Generating Links
	                        for(var i=0; i<mxCell.length; i++){
	                             
	                             //Generating links
	                             if(mxCell[i].mxGeometry){
	                               var cell = mxCell[i]._attributes;

	                               if(cell.edge)
	                                 { 
	                                   if(cell.target && cell.source)
	                                   {
	                                   var pushobject = {};
	                                   pushobject.id = cell.id;
	                                   pushobject.from = cell.source;
	                                   pushobject.to = cell.target;
	                                   pushobject.text = "";
	                                   if(cell.value)
	                                     pushobject.text = cell.value;

	                                   links.push(pushobject)
	                                 }
	                                 }                                 
	                            
	                        }}
	                        //Generating Nodes
	                        for(var i=0; i<mxCell.length; i++){
	                             if(mxCell[i].mxGeometry){
	                               var cell = mxCell[i]._attributes;

	                               if(cell.value && cell.value!="" && !cell.edge)
	                               { 

	                                 var cell = mxCell[i]._attributes;
	                                 var pushobject = {};
	                                 pushobject.id = cell.id;

	                                 pushobject.primary="P";
	                                 
	                                 //Categorizing if a node is primary, tertiary or normal
	                                 for(var a=0; a<links.length; a++)
	                                 {
	                                   if(links[a].to==pushobject.id)
	                                     pushobject.primary="N";
	                                 }

	                                 
	                                 
	                                 pushobject.text = cell.value;

	                                 nodes.push(pushobject);
	                         
	                      }}}
	                      //console.log(nodes);
	                           
	                          var outp = combinator(nodes, links);
	                          var obj = {results:outp, nodes:nodes, links:links};
	                          return obj;
	                          //console.log("output generated");
	                          //displayCombinations(outp, nodes, links);
	                          //Simulate a wait time, and remove the loader gif
	                        setTimeout(function(){ 
	                          console.log('here came');
	                          //document.getElementById("loader").style.display='none';
	                          //document.getElementById("results").style.display='block'; 
	                        }, 1500);
	                        
	                        }
	                        catch(e)
	                        {
	                          //Display Error Page, and give a back button
	                          //document.getElementById("loader").style.display='none';
	                          //document.getElementById("generator").style.display='block';
	                        }
	                    }

