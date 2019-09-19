
var numRatings;
var pageSize = 5;
var visiblePagerLinks = 5;
var numPages;
var accessToken ='ratings-access-token00-8fea-10cb5of24fsq';
 //var host = "http://localhost:46003";
 var host = "https://reg.openapi-studio.com"

$(document).ready(function () {
    axios.defaults.headers.common['access_token'] =accessToken;
    axios.get(host + "/rating/reviewed/count")
        .then(res => {
            var size = JSON.parse(JSON.stringify(res.data));
            numRatings = size;
            getOrderdPageRatings(null, 0);
            
            if(size==0){
             var buttons= document.getElementById("page-buttons");            
             buttons.style.visibility = "hidden";
            }
        })
        .catch(error => console.log(error));
    // get pages start dates
    axios.get(host + "/rating/reviewed/pages/dates?is_ascending=false&page_size=" + pageSize)
        .then(res => {
            var pdates = JSON.parse(JSON.stringify(res.data));
            var pager = $('.pager');
            pager.data("pagesDates", pdates);
        })
        .catch(error => console.log(error));

});

function getOrderdPageRatings(creationDate, page) {
    var date = (creationDate == null || isNaN(creationDate)) ? "" : "&creation_date=" + creationDate;
    axios.defaults.headers.common['access_token'] = accessToken;
    axios.get(host + "/rating/reviewed?is_ascending=false&page_size=" + pageSize + date)
        .then(res => {
            var ratings = JSON.parse(JSON.stringify(res.data));
            for (var i in ratings) {
                var rating = ratings[i];               
                var div1 = document.getElementById("reviews");
                var review = document.createElement("div");
                review.innerHTML = getRatingView(rating);
                div1.appendChild(review);
            }
            var pager = $('.pager');
            if (page > 0) {
                pager.data("" + (page + 1), ratings[ratings.length - 1].creation_date);
            }
            if (creationDate == null) {
                pager.data("0", null);
                pager.data("1", ratings[ratings.length - 1].creation_date);        
                displayPager({ pagerSelector: '#myPager', showPrevNext: true, hidePageNumbers: false, perPage: pageSize });
            }
        })
        .catch(error => console.log(error));
}

function pageSelectionDisplayRatings(creationDate) {
    var date = (creationDate == null || isNaN(creationDate)) ? "" : "&creation_date=" + creationDate;
    axios.defaults.headers.common['access_token'] = accessToken;
    axios.get(host + "/rating/reviewed?is_ascending=false&page_size=" + pageSize + date)
        .then(res => {
            var ratings = JSON.parse(JSON.stringify(res.data));
            for (var i in ratings) {
                var rating = ratings[i];               
                var div1 = document.getElementById("reviews");
                var div2 = document.createElement("div");
                div2.innerHTML = getRatingView(rating);
                div1.appendChild(div2);
            }
        })
        .catch(error => console.log(error));
}

function getRatingView(rating) {
    return '<div class="review-block">' +
        '<div class="row">' +
        '<div  class="col-md-3" style="padding-right:0px;">' +
        '<div class="review-block-name"><a href="#">' +
        (!rating.user_name || rating.user_name.length === 0 ? "Anonymous" : rating.user_name) +
        '</a></div>' +
        '<div class="review-block-date">' + toLocalTime(rating.creation_date) + '<br/>'
        + displayTimeAgo(new Date(rating.creation_date)) + '</div>' +
        '</div>' +
        '<div class="col-md-9" >' +
        '<div class="review-block-stars">' + getStartsView(rating) +
        '</div>' +
        '<div  class="review-block-description">' + rating.comment + '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
}

function getStartsView(rating) {
    var result = "";
    var stars = rating.rate;
    for (var i = 1; i <= 5; i++) {
        if (i <= stars) {
        	  result +='<span style="color:orange;"><i class="fa fa-star fa-lg" aria-hidden="true"></i></span>';           
        } else {
        	  result +='<span style="color:orange;"><i class="fa fa-star-o fa-lg" aria-hidden="true"></i></span>';                 
        }
        result += "&nbsp;";
    }
    return result;
}

function toLocalTime(date) {
    // return moment(date).local().format('LLL'); //lll short month name
   return new Intl.DateTimeFormat('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    }).format(new Date(date))
}

function displayTimeAgo(date) {
    var now = moment().startOf('day');// set to 12:00 am today
    var end = moment(date).startOf('day');// set to 12:00 am today
    var years = now.diff(end, 'years');

    if (years > 0) {
        return years == 1 ? years + " year ago" : years + " years ago";
    }
    var months = now.diff(end, 'months');
    if (months > 0) {
        return months == 1 ? months + " month ago" : months + " months ago";
    }
    var days = now.diff(end, 'days');
    if (days > 0) {
        return days == 1 ? days + " day ago" : days + " days ago";
    }
    if (now.isSame(end, 'day')) {
        return "Today";
    }
    var hours = now.diff(end, 'hours');  
    if (hours > 0) {
        return hours == 1 ? dhoursays + " hour ago" : hours + " hours ago";
    }
    return "";
}

function displayPager(opts) {
    var $this = this,
        defaults = {
            perPage: 10,
            showPrevNext: false,
            hidePageNumbers: false
        },
        settings = $.extend(defaults, opts);

    var perPage = settings.perPage;
    var pager = $('.pager');

    if (typeof settings.pagerSelector != "undefined") {
        pager = $(settings.pagerSelector);
    }
    numPages = Math.ceil(numRatings / perPage);

    // display info
    $("#page-total").text("Pages:" + (!numPages ? "-" : numPages));
    $('#total-reviews').text((!numRatings ? "-" : numRatings));

    pager.data("curr", 0);
    if (settings.showPrevNext) {
        $('<li class="page-item"><a href="#" class="page-link prev_link">«</a></li>').appendTo(pager);
    }

    var curr = 0;
    while (numPages > curr && (settings.hidePageNumbers == false)) {
        $('<li  class="page-item"><a href="#" class="page-link num-link">' + (curr + 1) + '</a></li>').appendTo(pager);
        curr++;
    }
    if (visiblePagerLinks > 1) {
        $('.num-link').hide();
        $('.num-link').slice(pager.data("curr"), visiblePagerLinks).show();
    }

    if (settings.showPrevNext) {
        $('<li class="page-item"><a href="#" class="page-link next_link">»</a></li>').appendTo(pager);
    }

    pager.find('.num-link:first').addClass('active');
    pager.find('.prev_link').hide();
    if (numPages <= 1) {
        pager.find('.next_link').hide();
    }
    pager.children().eq(1).addClass("active");
    pager.find('li .num-link').click(function () {
        var clickedPage = $(this).html().valueOf() - 1;
        goTo(clickedPage);
        return false;
    });
    pager.find('li .prev_link').click(function () {
        previous();
        return false;
    });
    pager.find('li .next_link').click(function () {
        next();
        return false;
    });

    function previous() {
        var goToPage = parseInt(pager.data("curr")) - 1;
        goTo(goToPage);
    }

    function next() {
       var goToPage = parseInt(pager.data("curr")) + 1;
        goTo(goToPage);
    }
}


function goTo(page) {
    var pager = $('.pager');
    var container = document.getElementById("reviews");
    var fc = container.firstChild;
    while (fc) {
        container.removeChild(fc);
        fc = container.firstChild;
    }

    if (page >= 1) {
        pager.find('.prev_link').show();
    } else {
        pager.find('.prev_link').hide();
    }

    if (page < (numPages - 1)) {
        pager.find('.next_link').show();
    } else {
        pager.find('.next_link').hide();
    }

    pager.data("curr", page);

    if (visiblePagerLinks > 1) {
        $('.num-link').hide();
        $('.num-link').slice(page, visiblePagerLinks + page).show();
    }

    pager.children().removeClass("active");
    pager.children().eq(page + 1).addClass("active");
    // console.log(pager.data());
    if (page == 0) {
        getOrderdPageRatings(parseInt(pager.data("" + page)), page);
    } else {
        pageSelectionDisplayRatings(parseInt(pager.data("pagesDates")[page - 1]));
    }
}


function handlePageInput() {
    const pageNum = document.getElementById('page-input');
    const value = parseInt(pageNum.value);
    if (!value) {
        console.log("value '" + pageNum.value + "' is not number!");
    } else {
        if (value <= numPages) {
            goTo(value - 1);
        } else {
            console.log("Page '" + value + "' does not exist.");
        }
    }
}

function handlePageLinkSelection() {
    const perPageNum = document.getElementById('page-selection').value;
    const value = parseInt(perPageNum);
    if (!value) {
        console.log("value '" + perPageNum + "' is not number!");
    } else {
        var container = document.getElementById("reviews");
        var fc = container.firstChild;
        while (fc) {
            container.removeChild(fc);
            fc = container.firstChild;
        }

        var pager = document.getElementById('myPager'); 
        var pfc = pager.firstChild;   
         while (pfc) {
            pager.removeChild(pfc);
            pfc = pager.firstChild;
        }
        pageSize=value;       
        getOrderdPageRatings(null, 0);      
    }
}


