var tick_format = {
    format: d3.timeFormat("%b %Y"),
    tickTime: d3.timeYears,
    tickInterval: 15,
    tickSize: 6
},

    parties = [
        "Bharatiya Janata Party",
        "Indian National Congress",
        "Indian National Congress (I)",
        "Janata Dal",
        "Janata Party",
        "Janata Party (Secular)",
        "Samajwadi Janata Party"
    ],

    colors = [
        '#FF9933', // BJP
        '#00BFFF', // INC
        '#00BFFF', // INC (I)
        '#2E8B57', // JD
        '#1F75FE', // JP
        '#00008B', // JP(S)
        '#74C365', // SJP
    ],

    colorScale = d3.scaleOrdinal()
    .range(colors)
    .domain(parties);


var process_data = function(error, data){
    if (error) throw error;

    var chart = d3.timelines()
        .stack()
        .tickFormat(tick_format)
        .itemHeight(30)
        .colors(colorScale)
        .colorProperty('party')
        .rowSeparators('lightgrey');

    var svg = d3.select("#chart").append("svg").attr("width", window.innerWidth - 30)
        .datum(data).call(chart);
};

d3.queue()
    .defer(d3.json, "data/events.json")
    .await(process_data);
