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
    var dataset = transformdata(json)[0]
    var paletteScale = transformdata(json)[1]

    drawmap(json, dataset, paletteScale);
    newgraph(dataset, dataset.NLD.country, paletteScale)
    });
}
    function transformdata(json) {

      // create data dictionaries
      var qualitydata = {};
      for(let i = 1, l = Object.keys(json).length; i < l; i++) {
        qualitydata[json[i].Country] = json[i]["Quality of Life Index"];
      }

      var countries = Datamap.prototype.worldTopo.objects.world.geometries;

      // pair up countries from both datasets
      let replacekey = Object.keys(qualitydata).map((key) => {
        for (var i = 0, j = countries.length; i < j; i++) {
          if (countries[i].properties.name == key){
            var newkey = countries[i].id
            return [newkey, qualitydata[key], key]
          }
        }
      })

      // remove countries without data
      replacekey = replacekey.filter(function( element ) {
         return element !== undefined;
      });

      var dataset = {};

      // create color palette
      var onlyValues = replacekey.map(function(obj){ return obj[1]; });
      var minValue = Math.min.apply(null, onlyValues),
          maxValue = Math.max.apply(null, onlyValues);

      var paletteScale = d3v5.scaleSequential()
            .domain([minValue,maxValue])
            .interpolator(d3v5.interpolateRdYlGn);

      // fill datasets
      replacekey.forEach(function(item){ //
        var countrycode = item[0],
            index = Math.round(item[1]),
            country = item[2];
        dataset[countrycode] = { LifeIndex: index, fillColor: paletteScale(index), country : country };
      });

    var variables = [dataset, paletteScale]
    return variables;
  }

    function drawmap(data, dataset, paletteScale) {

      // draw map
      var map = new Datamap({
        element: document.getElementById('container'),
        scope : 'world',
        fills: { defaultFill: '#F5F5F5'},
        data: dataset,

        // set colors for hovering
        geographyConfig : {
          highlightOnHover : true,
          highlightFillColor: 'lightgoldenrodyellow',
          Opacity : 0.8,
          highlightBorderColor: 'darkgrey',
          highlightBorderWidth: 1,
          highlightBorderOpacity: 1,

          // show  Life Quality Index in tooltip
            popupTemplate: function(geo, data) {

                // don't show tooltip if no data for the country
                if (!data) {
                  return ['<div class="hoverinfo">',
                      '<br>Life Quality Index not available',
                      '</div>'].join('');
                    }

                // tooltip content
                return ['<div class="hoverinfo">',
                    '<strong>', geo.properties.name, '</strong>',
                    '<br>Life Quality Index: <strong>', data.LifeIndex, '</strong>',
                    '</div>'].join('');
            }
        },

        // update barchart when clicking on country
        done: function(map) {
          map.svg.selectAll('.datamaps-subunit').on('click', function (geography) {
            for(let i = 0, j = Object.keys(data).length; i < j; i++) {
              if (geography.properties.name == Object.values(data)[i].Country) {
                  update(dataset, geography.properties.name, paletteScale);
                }
              else {
                continue;
              }
            }
          })

          map.svg.append('text')
               .attr("x", 300)
               .attr("y", 15 )
               .attr("text-anchor", "middle")
               .style("font-size", "16px")
               .style("text-decoration", "underline")
               .style("font-style", "italic")
               .text("Life Quality Index around the world");
        }
      });

      // set dimensions of legend elemenet
      var margin = {top: 70, right: 20, bottom: 95, left: 50},
          w = 100 - margin.left - margin.right,
          h = 500 - margin.top - margin.bottom,
          padding = 40;

      // legend labels & color
      var keys = ["< 90", " ", "", "  ", "    ", "     ", "      ", "> 190"];
      var color = d3v5.scaleOrdinal()
          .domain(keys)
          .range(d3v5.schemeRdYlGn[8]);

      // create legend
      var legend = d3v5.select("div#container").append("svg")
            .attr("class", "legend")
            .attr("width", w + margin.left + margin.right)
            .attr("height", h + margin.bottom + margin.top)
          .selectAll("g")
            .data(keys)
            .enter().append("g")
          .attr("transform", function(d, i) { return "translate(0," + i * -20 + ")"; });

          // draw legend colored rectangles
          legend.append("rect")
                .attr("x", w + 35)
                .attr("y", h / 1.5)
                .attr("width", margin.right)
                .attr("height", margin.right)
                .style("fill", color);

          // print legend text
          legend.append("text")
                .attr("x", w + 29)
                .attr("y", h / 1.45)
                .attr("dy", ".35em")
                .style("text-anchor", "end")
                .text(function(d) {
                  return d;
                });
          // add legend title
          d3v5.select("div#container").select("svg.legend").append('text')
               .attr("x", 70)
               .attr("y", 50 )
               .attr("text-anchor", "middle")
               .style("font-size", "16px")
               .style("font-style", "italic")
               .text("Index");

      }

        function newgraph (countrydata, name, paletteScale) {

          // create an array containing the indeces
          var dataset = []
          Object.keys(countrydata).forEach(function(key) {
            dataset.push(countrydata[key].LifeIndex)
          })

          // calculate the mean of the index
          var sum = dataset.reduce((previous, current) => current += previous);
          let average = sum / dataset.length;
          average = Math.round(average);


          // set dimensions
          var margin = {top: 70, right: 20, bottom: 95, left: 50},
              w = 250 - margin.left - margin.right,
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
          var svg = d3v5.select("div#barchart")
                      .attr("class", "graph")
                      .append("svg")
                      .attr("width", w + margin.left + margin.right)
                      .attr("height", h + margin.bottom + margin.top)
                    .append("g")
                      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          svg.call(tip);

          // determine index & color for the country
          Object.keys(countrydata).forEach(function(key) {
            if (name == countrydata[key].country) {
              countryindex = countrydata[key].LifeIndex,
              fillcolor = countrydata[key].fillColor;
            }
          })

          var obj = {"World Average" : average, [name] : countryindex}

          var averagecolor = paletteScale(average);
          var color = [averagecolor, fillcolor];

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
            .attr("fill", function(d, i) {
              return color[i];
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
                .text("Life Quality Index");

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
                .style("font-style", "italic")
                .text("Comparison of index to average");
        }

    function update(countrydata, name, paletteScale) {

      // create an array containing the indeces
      var dataset = []
      Object.keys(countrydata).forEach(function(key) {
        dataset.push(countrydata[key].LifeIndex)
      })

      // calculate the mean of the index
      var sum = dataset.reduce((previous, current) => current += previous);
      var average = sum / dataset.length;
      average = Math.round(average);

      // set dimensions
      var margin = {top: 70, right: 20, bottom: 95, left: 50},
          w = 250 - margin.left - margin.right,
          h = 400 - margin.top - margin.bottom,
          barPadding = 1;

      //create tip
      var tip = d3v5.tip()
          .attr('class', 'd3-tip')
          .offset([-10, 0])
          .html(function(d) {
            return "<strong>Index:</strong> <span style='color:lavender'>" + d + "</span>";
            })

      var xScale = d3v5.scaleBand()
                      .range([0, w ])
                      .padding(.01)

      var yScale = d3v5.scaleLinear()
                      .range([h, 0])


      // determine index & color for the country
      Object.keys(countrydata).forEach(function(key) {
        if (name == countrydata[key].country) {
          countryindex = countrydata[key].LifeIndex,
          fillcolor = countrydata[key].fillColor;
        }
      })

      var obj = {"World Average" : average, [name] : countryindex}

      var averagecolor = paletteScale(average);
      var color = [averagecolor, fillcolor];

      // set the domains
      xScale.domain(Object.keys(obj))
      yScale.domain([0, d3v5.max(dataset, function(d) { return d; })]);

      // select svg
      var svg = d3v5.select("div#barchart.graph")
        .select("svg")

      svg.call(tip);

      // remove old bar
      // svg.selectAll("rect")
      // .remove();

      // remove country label
      svg.select("g.x.axis").selectAll("g.tick").remove();

      // draw new bar
      svg.select("g").selectAll("bar")
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
        .attr("fill", function(d, i) {
          return color[i];
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

        // add new labels
        svg.select("g.x.axis")
          .call(d3v5.axisBottom(xScale))
        .selectAll("text")
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", "-.55em")
          .attr("transform", "rotate(-90)" );

    }
