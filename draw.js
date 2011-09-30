// Utils for drawing lines and graphs and stuff
var g = new Graph();

function draw_line(visit_id, referrer_id) {
    visit_div = $("#visit_" + visit_id);
    referrer_div = $("#visit_" + referrer_id);

    visit = history_visits[visit_id];
    referrer = history_visits[referrer_id];

    g.addNode("visit_" + visit_id);
    g.addNode("visit_" + referrer_id);
    g.addEdge("visit_" + visit_id, "visit_" + referrer_id, {directed: true});
}
