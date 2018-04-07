var express = require("express");
var router = express.Router();
var db = require("../models");

// get all Headlines from the db
router.get("/api/headlines", function(req, res)
{
  console.log("request query:", req.query);
  let query_saved = (req.query.saved == 'true') ? true : false;
  // find all saved/unsaved Headlines in the db
  db.Headline.find({saved: query_saved}).then(function(dbHeadline)
  {
    // on success, send them back to the client
    res.json(dbHeadline);
  }).catch(function(err)
  {
    res.json(err);
  });
});

// get all Headlines from the db
router.put("/api/headlines", function(req, res)
{
  console.log('headline PUT req.body,', req.body);
  // find all unsaved Headlines in the db
  db.Headline.findOneAndUpdate({_id: req.body._id}, {saved: true}, {returnNewDocument: true}).then(function(result)
  {
    // on success, send back 'ok'
    res.json(result);
  }).catch(function(err)
  {
    res.json(err);
  });
});

// get a specific Headline by id, populate it with it's notes
router.get("/api/headlines/:id", function(req, res)
{
  // find one headline with matching _id
  // populate all the associated notes
  db.Headline.findOne({_id: req.params.id}).populate("notes").then(function(dbHeadline)
  {
    // on success, send it back to the client
    res.json(dbHeadline);
  }).catch(function(err)
  {
    res.json(err);
  });
});

// save/update a Headline's associated Note
router.post("/api/headlines/:id", function(req, res)
{
  db.Note.create(req.body).then(function(dbNote)
  {
    // on success, find one Headline with an `_id` equal to `req.params.id`
    // update the Headline to be associated with the new Note
    // { new: true } says to return the updated Headline (default is to return original)
    // chain another .then which receives the result of the query
    return db.Headline.findOneAndUpdate({_id: req.params.id}, {$push: {notes: dbNote._id}}, {new: true});
  }).then(function(dbHeadline)
  {
    // on success, send it back to the client
    res.json(dbHeadline);
  }).catch(function(err)
  {
    res.json(err);
  });
});

module.exports = router;
