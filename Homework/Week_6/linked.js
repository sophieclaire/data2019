/*
Sophie Stiekema,
10992499,
This file creates two linked graphs
https://github.com/markmarkoh/datamaps
*/

window.onload = jscode();

function jscode() {

  fetch("data.json")
    .then(response => response.json())
    .then(json => {
      console.log(json)
      // create data dictionaries

      var qualitydata = {},
          costdata = {}
      for(let i = 1, l = Object.keys(json).length; i < l; i++) {
        qualitydata[json[i].Country] = json[i]["Quality of Life Index"]
        costdata[json[i].Country] = json[i]["Cost of Living Index"];
      }

      console.log(qualitydata)
      console.log(costdata)


      var countries = Datamap.prototype.worldTopo.objects.world.geometries;
      console.log(countries)


      // pair up countries from both datasets
      let replacekey = Object.keys(qualitydata).map((key) => {
        for (var i = 0, j = countries.length; i < j; i++) {
          if (countries[i].properties.name == key){
            // console.log(countries[i].properties.name);
            // console.log(key)
            // console.log(data[key])
            var newkey = countries[i].id
            return [newkey, qualitydata[key]]
          }
        }
      })
      replacekey = replacekey.filter(function( element ) {
         return element !== undefined;
      });
      console.log(replacekey)

      var dataset = {};

      // create color palette
      var onlyValues = replacekey.map(function(obj){ return obj[1]; });
      var minValue = Math.min.apply(null, onlyValues),
          maxValue = Math.max.apply(null, onlyValues);

      var paletteScale = d3v5.scaleLinear()
            .domain([minValue,maxValue])
            .range(["#EFEFFF","#02386F"]);

      // fill dataSets
      replacekey.forEach(function(item){ //
        var country = item[0],
            index = item[1];
        dataset[country] = { numberOfThings: index, fillColor: paletteScale(index) };
    });
    console.log(dataset)

    drawmap(json, dataset);

    //newgraph(json)
    });


    function drawmap(data, dataset) {

          var map = new Datamap({
            element: document.getElementById('container'),
            scope : 'world',
            fills: { defaultFill: '#F5F5F5' },
            data: dataset,
            geographyConfig : {
              // show  Life Quality Index in tooltip
                popupTemplate: function(geo, data) {
                    // don't show tooltip if no data for the country
                    if (!data) { return ; }
                    // tooltip content
                    return ['<div class="hoverinfo">',
                        '<strong>', geo.properties.name, '</strong>',
                        '<br>Life Quality Index: <strong>', data.numberOfThings, '</strong>',
                        '</div>'].join('');
                }
            },
            done: function(datamap) {
            datamap.svg.selectAll('.datamaps-subunit').on('click', function (geography) {
                console.log(geography.properties.name);
                newgraph(data, geography.properties.name);
            })
          }
        });

        // NOT WORKING
        // Draw a legend for this map
        var legend = d3v5.select("svg")
            .data(dataset)
            .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        var w = 500;
        // draw legend colored rectangles
        legend.append("rect")
              .attr("x", w - 100)
              .attr("width", 18)
              .attr("height", 18)
              .style("fill", function (d) {
                d.fillcolor;
              });

        // print legend text
        legend.append("text")
              .attr("x", w - 50)
              .attr("y", 9)
              .attr("dy", ".35em")
              .style("text-anchor", "end")
              .text(function(d) {
                return d;
              });

        }

        function newgraph (countrydata, name) {

          console.log(countrydata[1]["Quality of Life Index"])
          var dataset = []

          // create an array containing the indeces
          for (var i = 1, j = Object.keys(countrydata).length; i < j; i++) {
            dataset.push(countrydata[i]["Quality of Life Index"])
          }
            console.log(dataset)
          // calculate the mean of the index
          var sum = dataset.reduce((previous, current) => current += previous);
          let average = sum / dataset.length;
          console.log(average)

          // set dimensions
          var margin = {top: 70, right: 20, bottom: 95, left: 50},
              w = 200 - margin.left - margin.right,
              h = 400 - margin.top - margin.bottom,
              barPadding = 1;

          // set x & y scales & axes
          var xScale = d3v5.scaleBand()
                          .range([0, w ])
                          .padding(.01)

          var yScale = d3v5.scaleLinear()
                          .range([h, 0])

          var yAxis = d3v5.axisLeft(yScale),
              xAxis = d3v5.axisBottom(xScale);

          //create tip
          var tip = d3v5.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(function(d) {
                return "<strong>Index:</strong> <span style='color:lavender'>" + d + "</span>";
                })

          //create SVG element
          var svg = d3v5.select("body")
                      .append("svg")
                      .attr("width", w + margin.left + margin.right)
                      .attr("height", h + margin.bottom + margin.top)
                    .append("g")
                      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          svg.call(tip);

          for(let i = 1, j = Object.keys(countrydata).length; i < j; i++) {
            if (name == countrydata[i].Country ) {
              country = countrydata[i]["Quality of Life Index"];
            }
          }

          obj = {"World Average" : average, [name] : country}

          // set the domains
          xScale.domain(Object.keys(obj))
          yScale.domain([0, d3v5.max(dataset, function(d) { return d; })]);

          // draw the bars
          svg.selectAll("bar")
              .data(Object.values(obj))
            .enter().append("rect")
              .attr("class", "bar")
              .attr("x", function(d,i) {
                return xScale(Object.keys(obj)[i]);
                })
              .attr("y", function(d) {
                return yScale(d);
                })
            .attr("width", xScale.bandwidth())
            .attr("height", function(d) {
                return h - yScale(d);
                })
            .attr("fill", function(d) {
                return "rgb(80, 150, " + (d * 30) + ")";
                })
            .on('mouseover', tip.show)
            .on('mouseout', tip.hide);

            // add y-axis
            svg.append("g")
                .attr("class", "y axis")
                .attr("transform", "translate(" + barPadding + ",0)")
                .call(yAxis)
              .append("text")
                .attr("class", "y label")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left )
                .attr("x", 0 - h /2 )
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("fill", "black")
                .text("y");

            // add x-axis
            svg.append("g")
              .attr("class", "x axis")
              .attr("transform", "translate(0," + (h - barPadding) + ")")
              .call(xAxis)
            .selectAll("text")
              .style("text-anchor", "end")
              .attr("dx", "-.8em")
              .attr("dy", "-.55em")
              .attr("transform", "rotate(-90)" );

            svg.append("text")
                .attr("x", (w / 2))
                .attr("y", 0 - (margin.top / 2 ))
                .attr("text-anchor", "middle")
                .style("font-size", "16px")
                .style("text-decoration", "underline")
                .text("Comparison of indeces");


        }
}
