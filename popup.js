history_urls = {};
history_visits = {};

urls_left = 0;

function display_visits(visits) {
    if (visits.length === 0) {
        document.body.innerHTML = "No results";
    }
    console.log(urls_left);
    for (var i = visits.length-1; i >= 0; i--) {
        var visit = visits[i];
        console.log(visit);
        var url = history_visits[visit.visitId];
        console.log(url);
        var visit_date = new Date(visit.visitTime);
        var referrer = "unknown";
        if (visit.referringVisitId) {
            referrer = history_visits[visit.referringVisitId];
        }

        var result = "url " + url + " time " + visit_date.toLocaleString() + " visit " + visit.visitId + " referrer " + referrer + " transition " + visit.transition;
        result += "<br />";
        console.log(result);
        document.body.innerHTML += result;
    }
}

function set_history(url) {
    return function(visits) {
//        console.log("appending " + visits.length + " visits to " + url);
        history_urls[url].visits = visits;
        for (var i = 0; i < visits.length; i++) {
            history_visits[visits[i].visitId] = url;
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
