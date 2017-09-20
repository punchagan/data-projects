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

var format_pm_term = function(pm){
    var html = "";
    html += "<strong>" + pm.label + "</strong><br/>";
    html += "<strong>Party:</strong> " + pm.party +"<br/>";
    html += "<strong>Term Start:</strong> " + new Date(pm.starting_time).toDateString() +"<br/>";
    html += "<strong>Term End:</strong> " + new Date(pm.ending_time).toDateString() +"<br/>";
    return html;
};

var add_tooltip = function(){
    d3.select("#chart").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
};

var align_labels = function(){
    d3.selectAll('#chart .textlabels').attr('x', '40');
};

var process_data = function(error, data){
    if (error) throw error;

    add_tooltip();

    var chart = d3.timelines()
        .stack()
        .tickFormat(tick_format)
        .itemHeight(30)
        .colors(colorScale)
        .colorProperty('party')
        .rowSeparators('lightgrey')
        .mouseover(function(d) {
            var tooltip = d3.select('.tooltip');
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            console.log(d);
            tooltip.html(format_pm_term(d))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .mouseout(function(d) {
            var tooltip = d3.select('.tooltip');
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    var svg = d3.select("#chart").append("svg").attr("width", window.innerWidth - 30)
        .datum(data).call(chart);

    align_labels();
};

d3.queue()
    .defer(d3.json, "data/events.json")
    .await(process_data);
