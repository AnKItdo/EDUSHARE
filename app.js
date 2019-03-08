var express = require('express');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var path = require('path');
var app = express();
var routes = require('./node_files/routes/router.js');

//middleware
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set('views',path.join(__dirname,'/node_files/views'));
app.set('view engine','ejs');
app.use('/', routes); //include routes


app.listen(3000,function(){
	console.log('listening to port 3000');
});