var express = require("express");
var router = express.Router();

router.get("/", function(req, res)
{
  res.render("index", {script: "../../assets/js/index.js"});
});

router.get("/saved", function(req, res)
{
  res.render("saved", {script: "../../assets/js/saved.js"});
});

module.exports = router;
