var tick_format = {
    format: d3.timeFormat("%b %Y"),
    tickTime: d3.timeYears,
    tickInterval: 15,
    tickSize: 6
};

var process_data = function(error, data){
    if (error) throw error;

    var chart = d3.timelines()
        .stack()
        .showToday()
        .tickFormat(tick_format);

    var svg = d3.select("#chart").append("svg").attr("width", 1200)
        .datum(data).call(chart);
};

d3.queue()
    .defer(d3.json, "data/events.json")
    .await(process_data);
