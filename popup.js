function display_visits(visits) {
    if (visits.length === 0) {
        document.body.innerHTML = "No results";
    }
    for (var i = visits.length-1; i >= 0; i--) {
        visit = visits[i];
        console.log(visit);
        visit_date = new Date(visit.visitTime);
        var result = "time " + visit_date.toLocaleString() + " visit " + visit.visitId + " referrer " + visit.referringVisitId + " transition " + visit.transition;
        result += "<br />";
        console.log(result);
        document.body.innerHTML += result;
    }
}

function get_history_since(time) {
    chrome.history.search(
        {'text': '', 'startTime': time},
        function (history_items) {
            console.log("found " + history_items.length + " history items since " + time.toLocaleString());
            for (var i=0; i < history_items.length; i++) {
                
            }
        }
    );
}

chrome.tabs.getSelected(null, function(tab) {
    console.log("tab url: " + tab.url);
    chrome.history.getVisits({url: tab.url}, display_visits);
});
