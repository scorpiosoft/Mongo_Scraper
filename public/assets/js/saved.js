$(document).ready(function()
{
  // container reference
  var headline_container = $(".headline-container");
  // event listeners
  $(document).on("click", ".btn.delete", headline_delete);
  $(document).on("click", ".btn.notes", headline_notes);
  $(document).on("click", ".btn.save", note_save);
  $(document).on("click", ".btn.note-delete", note_delete);

  init_saved();

  // initialize the page with saved headlines
  function init_saved()
  {
    // empty the headline container
    headline_container.empty();
    $.get("/api/headlines?saved=true").then(function(data)
    {
      if (data && data.length)
      {
        // render saved headlines to the page
        render_headlines(data);
      }
      else
      {
        // render message no headlines
        render_empty();
      }
    });
  }

  // append headlines into the container
  // the headlines parm is an array
  function render_headlines(headlines)
  {
    var headline_cards = [];
    for (var i = 0; i < headlines.length; i++)
    {
      headline_cards.push(create_card(headlines[i]));
    }
    headline_container.append(headline_cards);
  }

  // convert db objects into card objects
  function create_card(headline)
  {
    // create the HTML for the card using jQuery
    var card = $(
      [
        "<div class='card w-100'>",
          "<div class='card-body'>",
            "<div class='card-title'>",
              "<h5 class='float-left'>",
              "<a class='headline-link' target='_blank' href='" + headline.link + "'>",
                headline.title,
              "</a>",
              "</h5>",
              "<a class='float-right btn btn-success save'>",
                "Save Article",
              "</a>",
            "</div>",
          "</div>",
        "</div>"
      ].join("")
    );
    var card = $(
      [
        "<div class='card w-100'>",
          "<div class='card-body'>",
            "<div class='card-title'>",
              "<h5 class='float-left'>",
              "<a class='headline-link' target='_blank' href='" + headline.link + "'>",
                headline.title,
              "</a>",
              "</h5>",
              "<a class='float-right btn btn-danger delete'>",
                "Delete From Saved",
              "</a>",
              "<a class='float-right btn btn-info notes'>",
                "Headline Notes",
              "</a>",
            "</div>",
          "</div>",
        "</div>"
      ].join("")
    );
    card.data("_id", headline._id);
    return card;
  }

  // display something useful to the user when no headlines are found
  function render_empty()
  {
    var emptyAlert = $(
      [
        "<div class='alert alert-warning text-center'>",
          "<h4>We don't have any saved headlines.</h4>",
        "</div>",
        "<div class='card'>",
          "<div class='card-body'>",
            "<div class='card-title text-center'>",
              "<h3>Would You Like to Browse Available Articles?</h3>",
            "</div>",
            "<div class='card-text text-center'>",
              "<h4><a href='/'>Browse Articles</a></h4>",
            "</div>",
          "</div>",
        "</div>"
      ].join("")
    );
    headline_container.append(emptyAlert);
  }

  // on click handler for deleting a headline
  function headline_delete()
  {
    // grab the .data element of the headline to delete
    var axe_it = $(this).parents(".card").data();
    $.ajax(
    {
      method: "DELETE",
      url: "/api/headlines/" + axe_it._id
    }).then(function(data)
    {
      // re-render if deleted
      if (data)
      {
        init_saved();
      }
    });
  }

  // on click handler for opening the notes modal
  function headline_notes()
  {
    // grab the .data element of the headline to note
    var note_it = $(this).parents(".card").data();
    // fetch notes for this headline
    $.get("/api/headlines/" + note_it._id).then(function(data)
    {
      // HTML for notes modal
      var modal_html =
      [
        "<div class='container-fluid text-center'>",
          "<h4>Notes For Article: ",
            note_it._id,
          "</h4>",
          "<hr />",
          "<ul class='list-group note-container'>",
          "</ul>",
          "<textarea class='form-control' placeholder='New Note' rows='4'></textarea>",
          "<button class='btn btn-success save'>Save Note</button>",
        "</div>"
      ].join("");
      bootbox.dialog({
        message: modal_html,
        closeButton: true
      });
      var note_obj =
      {
        _id: note_it._id,
        notes: data.notes || []
      };
      // attach headline data to note
      $(".btn.save").data("headline", note_obj);
      render_notes(note_obj);
    });
  }

  // render notes to the modal
  function render_notes(data)
  {
    var note_list = [];
    var note;
    if (!data.notes.length)
    {
      // no notes
      note = ["<li class='list-group-item'>", "No notes for this headline yet.", "</li>"].join("");
      note_list.push(note);
    } else {
      // have notes
      for (var i = 0; i < data.notes.length; i++)
      {
        // create the HTML note object
        note = $(
          [
            "<li class='list-group-item note'>",
            data.notes[i].text,
            "<button class='btn btn-danger note-delete'>x</button>",
            "</li>"
          ].join("")
        );
        // attach the note's id to the jQuery element, to be used to figure out which note to delete
        note.children("button").data("_id", data.notes[i]._id);
        note_list.push(note);
      }
    }
    $(".note-container").append(note_list);
  }

  // on click handler for saving a note
  function note_save()
  {
    var note_obj;
    // grab the note typed into the input box
    var new_note = $(".bootbox-body textarea").val().trim();

    if (new_note)
    {
      note_obj =
      {
        _id: $(this).data("headline")._id,
        text: new_note
      };
      $.post("/api/notes", note_obj).then(function()
      {
        // on success, close the modal
        bootbox.hideAll();
      });
    }
  }

  // on click handler for deleting a note
  function note_delete()
  {
    // grab the .data element of note to delete
    var axe_it = $(this).data("_id");
    $.ajax(
    {
      url: "/api/notes/" + axe_it,
      method: "DELETE"
    }).then(function()
    {
      // on success, hide the modal
      bootbox.hideAll();
    });
  }
});
