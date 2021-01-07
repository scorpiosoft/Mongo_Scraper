$(document).ready(function()
{
  // container reference
  var headline_container = $(".headline-container");
  // event listeners
  $(document).on("click", ".btn.save", headline_save);
  $(document).on("click", ".scrape-new", headline_scrape);

  init_index();

  // initialize the page with unsaved headlines
  function init_index()
  {
    // empty the headline container
    headline_container.empty();
    // ajax request for unsaved headlines
    $.get("/api/headlines?saved=false").then(function(data)
    {
      if (data && data.length)
      {
        // render unsaved headlines to the page
        render_headlines(data);
      } else {
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
            "<div class='card-title row'>",
              "<h5 class='float-left'>",
              "<a class='headline-link' target='_blank' href='" + headline.link + "'>",
                headline.title,
              "</a>",
              "</h5>",
            "</div>",
            "<div class='row justify-content-end'>",
              "<a class='float-right btn btn-success save'>",
                "Save Article",
              "</a>",
            "</div>",
          "</div>",
        "</div>"
      ].join("")
    );
    // attach the headline's id to the jQuery element, to be used to figure out which headline to save
    card.data("_id", headline._id);
    return card;
  }

  // display something useful to the user when no headlines are found
  function render_empty()
  {
    var empty_alert = $(
      [
        "<div class='alert alert-warning text-center'>",
          "<h4>We don't have any new headlines.</h4>",
        "</div>",
        "<div class='card'>",
          "<div class='card-body'>",
            "<div class='card-title text-center'>",
              "<h3>What Would You Like To Do?</h3>",
            "</div>",
            "<div class='card-text text-center'>",
              "<h4><a class='scrape-new'>Try Scraping New Articles</a></h4>",
              "<h4><a href='/saved'>Go to Saved Articles</a></h4>",
            "</div>",
          "</div>",
        "</div>"
      ].join("")
    );
    headline_container.append(empty_alert);
  }

  // click handler to save a headline
  function headline_save()
  {
    // retrieve the .data element
    var new_headline = $(this).parents(".card").data();
    new_headline.saved = true;
    console.log("headline_save b4 ajax,", new_headline);
    // update the db
    $.ajax(
    {
      method: "PUT",
      url: "/api/headlines",
      data: new_headline
    }).then(function(data)
    {
      if (data)
      {
        // reload the page
        init_index();
      }
    });
  }

  // click handler for scraping new headlines
  function headline_scrape()
  {
    $.get("/api/scrape").then(function(message)
    {
      // reload page with new headlines
      init_index();
      bootbox.alert("<h3 class='text-center mt-5'>" + message + "<h3>");
    });
  }
});
