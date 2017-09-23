/* Program logic
The programs accepts two inputs, a learning subject and a resource.
Once a subject is selected the program queries apis from all resouces and builds the html for each resource.
When the user selects a resource the program displays its html and hides the other resource.
*/

/*Program global variables   */

var subject, userlat, userlong;
const youTubeSearchApiUrl = "https://www.googleapis.com/youtube/v3/search";
const googleBooksApiUrl = 'https://www.googleapis.com/books/v1/volumes';
const meetUpApiUrl = 'http://api.meetup.com/2/groups';
const myGoogleKey = 'AIzaSyCHXrCpLMW0YYC6gQeu1jPxZZDwJwPEW3c';
const myMeetUpKey = '284b5e217b2251643d681b7e516d3b56';


/*These functions accept objects returned from API calls and build HTML Output. */
function displayYoutube(data) {
    var buildTheHtmlOutput = "";
    $.each(data.items, function (videosArrayKey, videosArrayValue) {
        buildTheHtmlOutput += "<div class='col-4'>";

        buildTheHtmlOutput += "<img class='stubImage'  src='" + videosArrayValue.snippet.thumbnails.high.url + "'/>"; //display video's thumbnail
        buildTheHtmlOutput += "<p class='display'>" + videosArrayValue.snippet.title + "</p>"; //output vide title
        buildTheHtmlOutput += "<a href='https://www.youtube.com/watch?v=" + videosArrayValue.id.videoId + "' target='_blank'><img src='/images/button.png'></a>";
        buildTheHtmlOutput += "</div>";
    });
    $("#youTubeResults").html(buildTheHtmlOutput);
};

function displayGooglebooks(data) {
    var bookhtml = '';
    $.each(data.items, function (bookkey, bookvalue) {
        bookhtml += '<div class="col-4">'
        bookhtml += '<img class="stubImage" src = "' + bookvalue.volumeInfo.imageLinks.thumbnail + '">';
        bookhtml += '<p class="display">' + bookvalue.volumeInfo.title + '<br>' +
            bookvalue.volumeInfo.authors + '</p>';
        //bookhtml += '<p class="display">' + bookvalue.volumeInfo.authors + '</p>';//
        bookhtml += '<a href="' + bookvalue.volumeInfo.previewLink + '" target="blank" ><img src="/images/button.png"></a>';
        bookhtml += '</div>';
    });
    $('#bookResults').html(bookhtml);
};

function displayMeetup(data) {
    var meetUpHtml = '';
    $.each(data.results, function (key, value) {
        meetUpHtml += '<div class="col-4">';
        meetUpHtml += '<div class="imageArea">';
        if (value.group_photo) {
            if (value.group_photo.highres_link.length > 0) {
                meetUpHtml += '<img class="stubImage"  src = "' + value.group_photo.photo_link + '">';
            }
        } else {
            meetUpHtml += '<img class="stubImage"  src = "images/meetup.png"/>';
        }
        meetUpHtml += '</div>'
        meetUpHtml += '<p class="display">' + value.name + '</p>';

        meetUpHtml += '<a href="' + value.link + '" target = "blank" class="infoButton btn btn-default" role="button"><img src="images/button.png"></a>';
        meetUpHtml += '</div>';
    });
    $('#meetUpResults').html(meetUpHtml);
};

/* These functions accept a search term, API url, and API key.  They then call the API and pass the data to the display functions.  */
function callGoogleBooks(subject, googleBooksApiUrl, myGoogleKey) {
    var query = {
        q: subject,
        maxResults: 12,
        key: myGoogleKey
    };
    var data = $.ajax({
            /* update API end point */
            url: googleBooksApiUrl,
            data: query,
            dataType: "json",
            /*set the call type GET / POST*/
            type: "GET"
        })
        .done(function (result) {
            /*console.log(result);*/
            displayGooglebooks(result);
            /* if the results are meeningful, we can just console.log them */
        })
        /* if the call is NOT successful show errors */
        .fail(function (jqXHR, error, errorThrown) {
            console.log(jqXHR);
            console.log(error);
            console.log(errorThrown);
        });
};

function callYouTube(subject, youTubeSearchApiUrl, myGoogleKey) {
    var query = {
        type: 'video',
        part: 'snippet',
        maxResults: 12,
        key: myGoogleKey,
        q: subject
    }
    $.getJSON(youTubeSearchApiUrl, query, displayYoutube);
};

function callMeetup(subject, meetUpApiUrl, myMeetUpKey) {

    var params = {
        sign: 'true',
        page: 9,
        lat: userLat,
        topic: subject,
        lon: userLong,
        key: myMeetUpKey
    };

    var result = $.ajax({
            /* update API end point */
            url: "http://api.meetup.com/2/groups",
            data: params,
            dataType: "jsonp",
            /*set the call type GET / POST*/
            type: "GET"
        })
        /* if the call is successful (status 200 OK) show results */
        .done(function (result) {
            console.log(result);
            displayMeetup(result);
            /* if the results are meeningful, we can just console.log them */
        })
        /* if the call is NOT successful show errors */
        .fail(function (jqXHR, error, errorThrown) {
            console.log(jqXHR);
            console.log(error);
            console.log(errorThrown);
        });
};


/*Gets the user lat and long for the meetup API */
navigator.geolocation.getCurrentPosition(function (position, userlat, userlong) {
    userLat = position.coords.latitude;
    userLong = position.coords.longitude;
});

/*Hides the output screens until the user selects one. */
$('#bookResults').hide();
$('#meetUpResults').hide();

/*Event handlers that displays the selected output screen and hides the others  */
$('#youTube').click(function () {
    $('#youTubeResults').show();
    $('#bookResults').hide();
    $('#meetUpResults').hide();
})
$('#googleBooks').click(function () {
    $('#bookResults').show();
    $('#youTubeResults').hide();
    $('#meetUpResults').hide();
})
$('#meetUp').click(function () {
    $('#meetUpResults').show();
    $('#youTubeResults').hide();
    $('#bookResults').hide();
});

/* Event handler that gets the subject the user wants and calls the functions that contact the respective API */
$("#subButton").on("click", function (event, userLat, userLong) {
    subject = $('#menu').val();
    callGoogleBooks(subject, googleBooksApiUrl, myGoogleKey);
    callYouTube(subject, youTubeSearchApiUrl, myGoogleKey);
    callMeetup(subject, meetUpApiUrl, myMeetUpKey, userLat, userLong);
});
