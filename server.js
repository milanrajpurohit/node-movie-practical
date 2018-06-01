/****************************
 SERVER MAIN FILE
 ****************************/
const config 		= require('./configs/configs');
const express 		= require('express');
const bodyParser 	= require('body-parser');
const cors 			= require('cors');

// Create Express App
const app = express();

// Parse Requests of Content-Type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// Parse Requests of Content-Type - application/json
app.use(bodyParser.json())

// CORS
app.use(cors());

// =======   Routing
require('./app/routes/UserRoutes.js')(app, express);
require('./app/routes/MovieRoutes.js')(app, express);

// Listening Server
app.listen(config.serverPort , () => {
	console.log(`Server running at http://localhost:${config.serverPort}`);
});
