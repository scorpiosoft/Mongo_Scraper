// dependencies
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
// request and cheerio make the scraping possible
var request = require("request");
var cheerio = require("cheerio");
// all the DB models
var db = require("./models");
// deployment port
var PORT = 3000;
// initialize Express
var app = express();

//
// Configure Middleware
//

// log ajax requests
app.use(logger("dev"));
// parse form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// serve the public folder as a static directory
app.use(express.static("public"));

// set mongoose to use promises
mongoose.Promise = Promise;
// Connect to the Mongo DB
// If deployed, use the deployed database. Otherwise use the local scraper database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scraper";
mongoose.connect(MONGODB_URI, { useMongoClient: true });

// Routes
// Example data from TwinCities.com
// <a class="article-title" href="https://www.twincities.com/2018/04/01/no-joke-nine-more-inches-of-snow-possible-this-week/" title="Will winter never end? About 8 inches of snow expected, plus cold weather on the way">
  
//         <span class="dfm-title optimizely-3022178">
//       Will winter never end? About 8 inches of snow expected, plus cold weather on the way    </span>

//       </a>
//       <a class="article-title" href="https://www.twincities.com/2018/04/02/red-flags-investigated-after-suv-cliff-plunge-that-killed-former-minnesota-family-of-8/" title="‘Red flags’ investigated after SUV cliff plunge that killed former Minnesota family of 8">
  
//         <span class="dfm-title optimizely-3022649">
//       ‘Red flags’ investigated after SUV cliff plunge that killed former Minnesota family of 8    </span>

//       </a>
// A GET route for scraping the TwinCities.com website
app.get("/scrape", function(req, res)
{
  // Make a request for TwinCites.com
  request("https://www.twincities.com/", function(error, response, html)
  {
    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    // For each element with a "title" class
    $(".article-title").each(function(i, element)
    {
      // Save the text and href of each link enclosed in the current element
      var title = $(element).children("span").text();
      var link = $(element).attr("href");

      // If this found element had both a title and a link
      if (title && link)
      {
        var result = {};
        result.title = title;
        result.link = link;
        // insert the data in the Headline collection
        db.Headline.create(result).then(function(dbResult)
        {
          // log the inserted data
          console.log(dbResult);
        }).catch(function(err)
        {
          // if error, send to client
          return res.json(err);
        });
      }
    });
  });
  // If we were able to successfully scrape and save an Article, send a message to the client
  res.send("Scrape Complete");
});

// Route for getting all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function(dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on localhost:" + PORT);
});
