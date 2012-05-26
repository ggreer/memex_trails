function log_url(tab_id, change_info, tab) {
    console.log(tab_id, change_info, tab);
}

chrome.tabs.onUpdated.addListener(log_url);
