// dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// deployment port
var PORT = process.env.PORT || 3000;
// initialize Express
var app = express();

//
// Configure Middleware
//

// log ajax requests
app.use(logger("dev"));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));
// parse application/json
app.use(bodyParser.json());
// serve the public folder as a static directory
app.use(express.static("public"));

// handlebars
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// set mongoose to use promises
mongoose.Promise = Promise;
// Connect to the Mongo DB
// If deployed, use the deployed database. Otherwise use the local scraper database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";
mongoose.connect(MONGODB_URI, { useMongoClient: true });

// import routes and give the server access to them
var html_routes     = require("./controllers/html.js");
var scrape_routes   = require("./controllers/scrape.js");
var headline_routes = require("./controllers/headline.js");
var note_routes     = require("./controllers/note.js");
app.use(html_routes);
app.use(scrape_routes);
app.use(headline_routes);
app.use(note_routes);

// start the server
app.listen(PORT, function() {
  console.log("App running on localhost:" + PORT);
});
