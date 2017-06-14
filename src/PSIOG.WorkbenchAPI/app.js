/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var data = require('./public/javascripts/data.js');
var applogic = require('./public/javascripts/GeneratorLogic.js');
var coordinates = require('./public/javascripts/ManageCoordinates.js');
var bodyParser     = require('body-parser');
var cors           = require('cors');
var router         = express.Router();
var convert = require('xml-js');
var flowChart = require('./public/javascripts/ManageFlowChart.js');
var app = express();

 
app.use(cors())

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
app.get('/CheckConnection', coordinates.getConnectionStatus);

app.get('/getCoordinates', coordinates.getCoordinates);
app.post('/addCoordinates', coordinates.addCoordinates);
app.get('/getCoordbyFlowId/:flowId', coordinates.getCoordbyFlowId);
app.get('/getCoordbyFlowIdBlockID/:id', coordinates.getCoordbyFlowIdBlockID);


//app.get('/getCoordinates', coordinates.getAssestsByFlowChart);


//app.delete('/deleteCoordinates', coordinates.deleteCoordinates);
//app.put('/updateCoordinates/:id', coordinates.updateCoordinates);

//Pass formData with key:xmlaData and value as the XML string and returns object with results, nodes and links []
app.post('/generateFromXml',function (req, res){


	//console.log(req.body);
	//console.log(req.body.xmlData);
	var xmlc = req.body.xmlData;

	
	var a1 = applogic.generateButtonXml(xmlc);
	res.json({results: a1.results, nodes: a1.nodes, links: a1.links  });
	return res;

});

//Pass an object with parameters --> nodes[] and links[] and returns object with results, nodes and links []
app.post('/generateFromJson',function (req, res){


	console.log(req.body);
	//console.log(req.body.xmlData);
	var id = req.body;
	var jsonc = getFlowChartByID(id);
  console.log(jsonc);
	
	var a1 = applogic.generateButtonJson(jsonc);

	res.json({results: a1.results, nodes: a1.nodes, links: a1.links  });
	return res;

});



app.get('/getAllFlowCharts', flowChart.getAllFlowCharts);
app.get('/getAllFlowChartNames', flowChart.getAllFlowChartNames);
app.post('/addFlowchart', flowChart.addFlowchart);
app.get('/getFlowChartByID/:id', flowChart.getFlowChartByID);
app.get('/getFlowChartByName/:id', flowChart.getFlowChartByName);
app.get('/getFlowChartByFlowIdBlockId/:flowId/:blockId', flowChart.getFlowChartByFlowIdBlockId);
app.post('/updateFlowchartByID', flowChart.updateFlowchartByID);










http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});




