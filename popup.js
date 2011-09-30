var history_urls = {}; // url -> visits
var history_visits_to_urls = {}; // visit id -> url
var history_visits = {}; // visit objects by visit id
var max_depth = 15;
var done = false;

function display_visit(visit, depth, parent) {
    depth = typeof(depth) !== "undefined" ? depth : 0;
    if (depth > max_depth) {
        $("#history_container").append("Depth exceeded");
        return;
    }

    //TODO: set an id for each of these elements and check if an element with that id already exists. we want to eliminate dupes.
    //if it already exists, draw a line or something

    console.log(visit);
    var url = history_visits_to_urls[visit.visitId];
    console.log(url);
    var visit_date = new Date(visit.visitTime);
    var referrer_url;
    if (visit.referringVisitId !== "0") { // chrome's history api likes to return ints as strings
        referrer_url = history_visits_to_urls[visit.referringVisitId];
    }
    var result = {
        visit: visit,
        url: url,
        referrer_url: referrer_url,
        depth: depth,
        visit_time: visit_date
    };

    visit_div = $("#visit_" + visit.visitId);
    if (visit_div.length === 0) {
        $("#visit_template_default").tmpl(result).appendTo("#history_container");
    }
    else {
        $("#history_container").append("<br>Dedupe<br>");
        console.log("id visit_" + visit.visitId + " already exists. not appending");
    }

    if (visit.referringVisitId) {
        var referrer_visit = history_visits[visit.referringVisitId];
        if (referrer_visit) {
            display_visit(referrer_visit, depth+1, visit);
            draw_line(visit.visitId, visit.referringVisitId);
        }
        else {
            console.log("visit id " + visit.referringVisitId + " references no visit");
        }
    }
}

function display_visits(visits) {
    $("#header").append("You have visited this page " + visits.length + " times<br />");
    if (visits.length === 0) {
        $("#history_container").append("No results");
    }
    for (var i = visits.length-1; i >= 0; i--) {
        display_visit(visits[i]);
    }
    $("#history_container").append("<hr />");
    var layouter = new Graph.Layout.Spring(g);
    layouter.layout();
    var renderer = new Graph.Renderer.Raphael('canvas', g, 500, 1000);
    renderer.draw();
}

function set_history(url) {
    return function(visits) {
//        console.log("appending " + visits.length + " visits to " + url);
        history_urls[url].visits = visits;
        for (var i = 0; i < visits.length; i++) {
            var visit = visits[i];
            history_visits_to_urls[visit.visitId] = url;
            history_visits[visit.visitId] = visit;
        }
    };
}

function get_history_since(time) {
    chrome.history.search(
        {'text': '', 'startTime': time, 'maxResults': 100000},
        function(history_items) {
            console.log("found " + history_items.length + " history items since " + time.toLocaleString());
            for (var i = 0; i < history_items.length; i++) {
                var hi = history_items[i];
                history_urls[hi.url] = hi;
                //todo: don't declare this function in a loop
                chrome.history.getVisits({"url": hi.url}, set_history(hi.url));
            }
//            console.log(history_urls);
            chrome.tabs.getSelected(null, function(tab) {
                console.log("tab url: " + tab.url);
                chrome.history.getVisits({url: tab.url}, display_visits);
            });
        }
    );
}

var now = new Date();
var last_month = now.getTime() - (1000 * 60 * 60 * 24 * 30);
get_history_since(last_month);
