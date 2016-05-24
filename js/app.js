/*
  Feedr app that
*/


/*************************************************************
*************** Basic Functionality **************************
*************************************************************/

$(function () {

  //Set current source as Marvel API
  var $currentSource = $('#currentSource a span');
  var $source = $currentSource.html('Marvel Comics');


  //Set the 3 sources and their names
  setSources();

  //runMarvel as the home screen listing
  runMarvel();

  //Run Marvel feed when clicking on Feedr logo
  $('#logo').on('click', function(){
    $('#results').html('');
    runMarvel();
    $currentSource.html('Marvel Comics')
  });

  //run feed for particular news source
  var $sourcePicker = $('#source-picker');
  changeFeed($currentSource);

  $('#search a').on('click', function(){
    if($(this).parent('#search').hasClass('active')){
      console.log('test');
      $(this).parent('#search').removeClass('active');
    } else {
      $(this).parent('#search').addClass('active');
    }
  });
});

function setSources(){
  $('#source-picker li:nth-child(1) a').html('Marvel Comics');
  $('#source-picker li:nth-child(2) a').html('New York Times');
  $('#source-picker li:nth-child(3) a').html('Underdetermined');
};

function changeFeed($current){
  $('#source-picker li').on('click', 'a', function() {
    $('#results').html('');
    if($(this).html() === 'Marvel Comics'){
      runMarvel();
      $current.html('Marvel Comics')
    } else if ($(this).html() === 'New York Times'){
      runNyt();
      $current.html('New York Times')
    } else {
      runOther();
      $current.html('Other')
    }
  });
};

function popupFunctions(){
  var $articleContent = $('.articleContent');
  var $popupClose = $('.closePopUp');

  $articleContent.on('click', function() {
    $(this).parent().parent().siblings('#popUp').removeClass('loader hidden');
  });

  $popupClose.on('click', function(){
    $(this).parent('#popUp').addClass('loader hidden');
  });
};

/*************************************************************
******************** Templating ******************************
*************************************************************/

function articleArray(arttitle,desc,url,image,impressions,tags){
  //Set article elements into key-value pairs
  var article = {};

    article.articleTitle = arttitle;
    article.articleDesc = desc;
    article.articleURL = url;
    article.articleImg = image;
    article.impressions = impressions;
    article.tag = tags;

  return article;
};

function loadTemplate(article){
  //Set the source of the Handlebars template and compile it
  var source = $('#articleTemplate').html()
  var template = Handlebars.compile(source);

  //Add in the article pairs into the template and then append to the results section
  var html = template(article);
  $('#results').append(html);
};


/*************************************************************
******** Marvel Events API | developer.marvel.com ************
*************************************************************/

function runMarvel(){
  var endptURL = 'http://gateway.marvel.com/v1/public/events?orderBy=startDate&apikey=';
  var apiKey = 'YOUR API KEY';

  $.ajax({
    url: endptURL + apiKey,
    dataType: 'json',
    success: function(response){
      console.log(response);

      //Iterate through each of the resulting objects to pull out the various elements
      for(var i = 0; i < response.data.results.length; i++){
          var eventTitle = response.data.results[i].title;
          var eventDesc = response.data.results[i].description;
          var eventURL = response.data.results[i].urls[0].url;
          var eventImage = response.data.results[i].thumbnail.path + "." + response.data.results[i].thumbnail.extension;
          var eventComics = response.data.results[i].comics.available;
          var eventCreatorsArray = response.data.results[i].creators.items;
          var eventCreators = parseCreators(eventCreatorsArray);

          function parseCreators (creators){
            if(creators.length !== 0){
              var creatorList = [];
              creatorList.push(creators[0].name);

              //console.log(creators[0].name);
              for(var i = 1; i < creators.length; i++){
                creatorList.push( " " + creators[i].name);
              }
              return creatorList;
            } else {
              return "No creators";
            }
          };
          var article = articleArray(eventTitle,eventDesc,eventURL,eventImage,eventComics,eventCreators);
          loadTemplate(article);
      }
      //After iterating through and setting up the template, add in the interactive functions.
      popupFunctions();
    }
  });
};

/*************************************************************
******** New York Times API | developer.nytimes.com **********
*************************************************************/

function runNyt(){
  var url = 'https://api.nytimes.com/svc/topstories/v2/home.json';
  url += '?' + $.param({
    'api-key': 'YOUR API KEY'
  });

  var response;
  $.ajax({
    url: url,
    method: 'GET',
    }).done(function(data) {
      console.log(data);
       for(var i = 0; i < data.results.length; i++){
           var articleHeadline = data.results[i].title;
           var articleDesc = data.results[i].abstract;
           var articleURL = data.results[i].url;
           var articleAllMedia = data.results[i].multimedia;
           var articleImage = findImage(articleAllMedia);
           var articleImpressions = data.results[i].org_facet.length;
           var articleByline = data.results[i].byline;

           function findImage(articleAllMedia){
               for (var i = 0; i < articleAllMedia.length; i++) {
                   if(articleAllMedia[i].format == "Standard Thumbnail") {
                       return articleAllMedia[i].url;
                   }
                }
            }
            var article = articleArray(articleHeadline,articleDesc,articleURL,articleImage,articleImpressions,articleByline);
            loadTemplate(article);
      }
      popupFunctions();
    }).fail(function(err) {
      throw err;
    });
};
