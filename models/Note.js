var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var NoteSchema = new Schema(
{
  // `text` is of type String
  text: String,
});

var Note = mongoose.model("Note", NoteSchema);

module.exports = Note;
