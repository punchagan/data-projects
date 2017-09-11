//Simple animated example of d3-cloud - https://github.com/jasondavies/d3-cloud
//Based on https://github.com/jasondavies/d3-cloud/blob/master/examples/simple.html

// Encapsulate the word cloud functionality
function wordCloud(selector) {

    //Construct the word cloud's SVG element
    var svg = d3.select(selector).append("svg")
        .attr("width", 500)
        .attr("height", 550)
        .style('background', 'white');

    var g = svg.append("g")
        .attr("transform", "translate(250,250)");

    svg.append('text').attr('id', 'year-label')
        .attr("transform", "translate(230,520)")
        .style("font-family", "Impact")
        .attr('font-size', 30);

    //Draw the word cloud
    function draw(words) {
        var cloud = g.selectAll("g text")
            .data(words, function(d) { return d.text+d.size; });

        //Entering words
        var cloud_enter  = cloud.enter()
            .append("text")
            .style("font-family", "Impact")
            .style("fill", function(d, i) { return d3.schemeCategory20[i%20]; })
            .attr("text-anchor", "middle")
            .attr('font-size', 1)
            .text(function(d) { return d.text; });

        //Transition
        cloud_enter
            .transition()
            .duration(600)
            .style("font-size", function(d) { return d.size + "px"; })
            .attr("transform", function(d) {
                return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .style("fill-opacity", 1);

        //Exiting words
        cloud.exit()
            .transition()
            .duration(200)
            .style('fill-opacity', 1e-6)
            .attr('font-size', 1)
            .remove();
    }


    //Use the module pattern to encapsulate the visualisation code. We'll
   // expose only the parts that need to be public.
    return {

        //Recompute the word cloud for a new set of words. This method will
        // asycnhronously call draw when the layout has been computed.
        //The outside world will need to call this function, so make it part
        // of the wordCloud return value.
        update: function(words) {
            d3.cloud().size([500, 500])
                .words(words)
                .padding(5)
                .rotate(function() { return ~~(Math.random() * 2) * 90; })
                .font("Impact")
                .fontSize(function(d) { return d.size; })
                .on("end", draw)
                .start();
        }
    };

}

var get_words = function(data, year) {
    return data[year]
        .map(function(d) {
            return {text: d.text, size: 10 + Math.min(d.count*2, 120)};
        });
}

//This method tells the word cloud to redraw with a new set of words.
var show_words = function (vis, data, gif, year) {
    var years = d3.keys(data),
        min = parseInt(d3.min(years)),
        max = parseInt(d3.max(years));

    year = year || min;
    year = year > max ? min: year;
    var words = get_words(data, year);
    console.log("Showing", year);
    show_year(year);
    vis.update(words);
    setTimeout(function() { show_words(vis, data, gif, year+1); }, 2000);

    // NOTE: Don't create GIF
    // if (gif.frames.length == years.length) {
    //     if (!gif.running) {
    //         gif.render();
    //     }
    // } else {
    //     setTimeout(update_gif, 800, gif);
    // }

};

var show_year = function(year) {
    d3.select('#year-label').text(year);
};

var process_data = function(error, data) {
    if (error) throw error;
    var word_cloud = wordCloud('#chart');

    var gif = new GIF({
        workers: 3,
        quality: 1,
        repeat: 0
    });

    d3.select('#chart').append('div').attr('class', 'gif');

    gif.on("progress", function(p){
        console.log(p);
    });

    gif.on("finished", function(blob){
        d3.select(".gif")
            .text("")
            .append("img")
            .attr("src", URL.createObjectURL(blob));
    });

    show_words(word_cloud, data, gif);
};

var update_gif = function(gif){
    var svg = d3.select('#chart').select('svg'),
        img = new Image(),
        serialized = new XMLSerializer().serializeToString(svg.node()),
        svg_blob = new Blob([serialized], {type: "image/svg+xml"}),
        url = URL.createObjectURL(svg_blob);

    img.onload = function(){
        gif.addFrame(img, {delay: 2000, copy: true});
    };
    img.src = url;
};



d3.queue()
    .defer(d3.json, 'data/counts-top.json')
    .await(process_data);
