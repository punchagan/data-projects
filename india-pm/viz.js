var process_data = function(error, data){
    if (error) throw error;

    console.log(data);
    var chart = d3.timelines().stack();
    var svg = d3.select("#chart").append("svg").attr("width", 1000)
        .datum(data).call(chart);
};

d3.queue()
    .defer(d3.json, "data/events.json")
    .await(process_data);
