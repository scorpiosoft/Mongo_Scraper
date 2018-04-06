let express = require("express");
let router = express.Router();
let db = require("../models");
// request and cheerio make the scraping possible
let request = require("request");
let cheerio = require("cheerio");

// Example data from TwinCities.com
// <a class="article-title" href="https://www.twincities.com/2018/04/01/no-joke-nine-more-inches-of-snow-possible-this-week/" title="Will winter never end? About 8 inches of snow expected, plus cold weather on the way">
//   <span class="dfm-title optimizely-3022178">
//     Will winter never end? About 8 inches of snow expected, plus cold weather on the way
//   </span>
// </a>
// GET route for scraping the TwinCities.com website
router.get("/api/scrape", function(req, res)
{
  // let count = 0;
  // make a request for TwinCites.com
  request("https://www.twincities.com/", function(error, response, html)
  {
    // count = 0;
    // load the html body from request into cheerio
    let $ = cheerio.load(html);
    // For each element with a "title" class
    $(".article-title").each(function(i, element)
    {
      // save the title and href
      // let title = $(element).children("span").text();
      let title = $(element).attr("title");
      let link = $(element).attr("href");

      // If this found element had both a title and a link
      if (title && link)
      {
        let result = {};
        result.title = title;
        result.link = link;
        // check if it exists
        db.Headline.findOne({title: title}).then(function(findResult)
        {
          if(findResult)
          {} else {
            // insert the data in the Headline collection
            db.Headline.create(result).then(function(dbResult)
            {
              // log the inserted data
              console.log(dbResult);
              // count++;
            }).catch(function(err)
            {
              // if error, send to client
              return res.json(err);
            });
          }
        });
      }
    });
    // send a message to the client to prevent it from hanging
    // async hell here, can't rely on the count
    // res.send(`Scrape Complete, found ${count} new articles`);
    res.send(`Scrape Complete`);
  });
});

module.exports = router;
