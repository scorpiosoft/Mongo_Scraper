var express = require("express");
var router = express.Router();
var db = require("../models");

// save a new Note to the db and associate it with a Headline
router.post("/api/notes", function(req, res)
{
  db.Note.create({text: req.body.text}).then(function(dbNote)
  {
    // on success, find the Headline for the _id passed in and push the new Note to it
    // { new: true } says to return the updated Headline (default is to return original)
    // chain another .then which receives the result of the query
    return db.Headline.findOneAndUpdate({_id: req.body._id}, {$push: {notes: dbNote._id}}, {new: true});
  }).then(function(result)
  {
    // on success, send it back to the client
    res.json(result);
  }).catch(function(err)
  {
    res.json(err);
  });
});

// delete the Note whose _id is passed in
router.delete("/api/notes/:id", function(req, res)
{
  db.Note.deleteOne({_id: req.params.id}).then(function(result)
  {
    return db.Headline.findOneAndUpdate({notes: req.params.id}, {$pull: {notes: req.params.id}});
  }).then(function(result)
  {
    res.json(result);
  }).catch(function(err)
  {
    res.json(err);
  });
});

module.exports = router;
