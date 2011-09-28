history_urls = {}; // url -> visits
history_visits_to_urls = {}; // visit id -> url
history_visits = {}; // visit objects by visit id
urls_left = 0;

function display_visit(visit, depth) {
    depth = typeof(depth) !== "undefined" ? depth : 0;
    if (depth > 5) {
        return;
    }

    console.log(visit);
    var url = history_visits_to_urls[visit.visitId];
    console.log(url);
    var visit_date = new Date(visit.visitTime);
    var referrer_url = "unknown";
    if (visit.referringVisitId !== 0) {
        referrer_url = history_visits_to_urls[visit.referringVisitId];
    }
    var result = "";
    for (var i = 0; i < depth; i++) {
        result += "..";
    }
    result += "url " + url + " time " + visit_date.toLocaleString() + " visit " + visit.visitId + " referrer " + referrer_url + " transition " + visit.transition;
    result += "<br />";
    console.log(result);
    document.body.innerHTML += result;
    if (visit.referringVisitId) {
        var referrer_visit = history_visits[visit.referringVisitId];
        if (referrer_visit) {
            return display_visit(referrer_visit, depth+1);
        }
        console.log("visit id " + visit.referringVisitId + " references no visit");
    }
}

function display_visits(visits) {
    document.body.innerHTML = "You have visited this url " + visits.length + " times<br />";
    if (visits.length === 0) {
        document.body.innerHTML = "No results";
    }
    console.log(urls_left);
    for (var i = visits.length-1; i >= 0; i--) {
        display_visit(visits[i]);
    }
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
        urls_left--;
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
                urls_left++;
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
