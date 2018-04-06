var express = require("express");
var router = express.Router();
var db = require("../models");
// request and cheerio make the scraping possible
var request = require("request");
var cheerio = require("cheerio");

// Example data from TwinCities.com
// <a class="article-title" href="https://www.twincities.com/2018/04/01/no-joke-nine-more-inches-of-snow-possible-this-week/" title="Will winter never end? About 8 inches of snow expected, plus cold weather on the way">
//   <span class="dfm-title optimizely-3022178">
//     Will winter never end? About 8 inches of snow expected, plus cold weather on the way
//   </span>
// </a>
// A GET route for scraping the TwinCities.com website
router.get("/api/scrape", function(req, res)
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
      // var title = $(element).children("span").text();
      var title = $(element).attr("title");
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

module.exports = router;
