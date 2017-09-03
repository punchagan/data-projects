var COUNTRY = "India",
    W = 100,
    H = 100,
    SEVERITY_CLASSES = {
        "1": {
            'class': 'large',
            'label': 'Large',
            'recurrence': '1 to 2 decades'
        },
        "1.5": {
            'class': 'very-large',
            'label': 'Very Large',
            'recurrence': '2 decades to 100 years'
        },
        "2": {
            'class': 'extreme',
            'label': 'Extreme',
            'recurrence': 'Greater than 100 years'
        }
    };

var show_floods = function (data, boundary, country, year) {
    var year_data = data[country][year],
        svg = d3.select('#year-'+year);

    if (year_data === undefined) {
        return;
    }

    //create geo.path object, set the projection to mercator
    var projection = d3.geoMercator(),
        path = d3.geoPath(projection);
    projection.fitSize([W, H], boundary);

    //draw svg lines of the boundries
    svg.append("g")
        .attr("class", "flood")
        .selectAll("path")
        .data(year_data)
        .enter()
        .append("path")
        .attr('data-severity', function(e){return e.properties.SEVERITY;})
        .attr('class', function(e){return SEVERITY_CLASSES[e.properties.SEVERITY].class + '-flood';})
        .attr("d", path)
        .on("mouseover", function(d) {
            var tooltip = d3.select('.tooltip');
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            console.log(d);
            tooltip.html(format_flood(d))
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            var tooltip = d3.select('.tooltip');
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

};

var show_map = function(data, year){
    var svg = d3.select('#chart')
        .append('svg')
        .attr('id', 'year-'+year)
        .attr('width', W)
        .attr('height', H);

    //create geo.path object, set the projection to mercator
    var projection = d3.geoMercator(),
        path = d3.geoPath(projection);
    projection.fitSize([W, H], data);

    //draw svg lines of the boundries
    svg.append("g")
        .attr("class", "india")
        .selectAll("path")
        .data(data.features)
        .enter()
        .append("path")
        .attr("d", path);

    svg.append("text").text(year).attr('dx', 50).attr('dy', 75);
};

var format_flood = function(d) {
    var html = "";
    html += "Cause: " + d.properties.MAINCAUSE +"<br/>";
    html += "Deaths: " + d.properties.DEAD +"<br/>";
    html += "Displaced: " + d.properties.DISPLACED +"<br/>";
    html += "Began: " + d.properties.BEGAN +"<br/>";
    html += "Ended: " + d.properties.ENDED +"<br/>";
    return html;
}

var show_legend = function(){
    var svg = d3.select('#chart')
        .append('svg')
        .attr('class', 'legend')
        .attr('width', W*6)
        .attr('height', H*1.2);

    svg.append("text").text("Flooding in India 1985 - 2017")
        .attr('dx', 180).attr('dy', 30).attr('class', 'title');

    svg.append("text").text("Flood severity class and recurrence interval")
        .attr('dx', 5).attr('dy', 65);

    var compare = function(a, b){
        if (a.class === 'large' || b.class === 'extreme') {
            return -1;
        } else if (a.class === 'extreme' || b.class === 'large') {
            return 1;
        }
        return 0;
    };
    d3.values(SEVERITY_CLASSES).sort(compare).forEach(function(severity, idx){
        var x = 150 * idx,
            y = 75,
            g = svg.append('g')
            .attr('transform', 'translate(' + x + ',' + y + ')');

        g.append("circle")
            .attr("cx", 10)
            .attr("cy", 10)
            .attr('r', 6)
            .attr('class', severity.class + '-flood');

        g.append("text").text(severity.label)
            .attr('dx', 20).attr('dy', 15).attr('class', 'label');

        g.append("text").text(severity.recurrence)
            .attr('dx', 5).attr('dy', 28).attr('class', 'recurrence');
    });
};

var add_tooltip = function(){
    var div = d3.select("#chart").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
};

var process_data = function(error, states, floods) {
    if (error) throw error;
    var india = topojson.feature(states, states.objects.IND_adm1),
        floods_nested = d3.nest()
        .key(function(d){return d.properties.COUNTRY;})
        .key(function(d){return d.properties.BEGAN.split('/')[0];})
        .sortValues(function severity(a, b) {return a.properties.SEVERITY > b.properties.SEVERITY;})
        .object(floods.features),
        years = d3.keys(floods_nested[COUNTRY]);
    show_legend();
    add_tooltip();
    d3.range(d3.min(years), 1+parseInt(d3.max(years))).forEach(function(year){
        show_map(india, year);
        show_floods(floods_nested, india, COUNTRY, year);
    });
};

d3.queue()
    .defer(d3.json, "https://cdn.rawgit.com/deldersveld/topojson/830a27a4d1900ca781d5f3dbccea1e499d88ff6d/countries/india/india-states.json")
    .defer(d3.json, "data/floods.json")
    .await(process_data);
