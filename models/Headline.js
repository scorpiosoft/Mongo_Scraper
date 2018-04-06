var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var HeadlineSchema = new Schema(
{
  // `title` is required and of type String
  title:
  {
    type: String,
    required: true
  },
  // `link` is required and of type String
  link:
  {
    type: String,
    required: true
  },
  // `saved` is type Boolean with a defaut of false
  saved:
  {
    type: Boolean,
    default: false
  },
  // `note` is an object that stores a Note id
  // ref links the ObjectId to the Note model
  note:
  {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

var Headline = mongoose.model("Headline", HeadlineSchema);

module.exports = Headline;
