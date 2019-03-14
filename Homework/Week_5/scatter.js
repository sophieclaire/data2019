/*
Sophie Stiekema,
10992499,
This file creates a scatter plot
*/

window.onload = function() {jscode()};

function jscode() {

  var purchasingPowerParities = "https://stats.oecd.org/SDMX-JSON/data/PPPGDP/PPP.AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LTU+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA+EA18+OECD/all?startTime=2009&endTime=2017&dimensionAtObservation=allDimensions";
  var gdp = "https://stats.oecd.org/SDMX-JSON/data/SNA_TABLE1/AUS+AUT+BEL+CAN+CHL+CZE+DNK+EST+FIN+FRA+DEU+GRC+HUN+ISL+IRL+ISR+ITA+JPN+KOR+LVA+LTU+LUX+MEX+NLD+NZL+NOR+POL+PRT+SVK+SVN+ESP+SWE+CHE+TUR+GBR+USA+EA19+EU28+OECD+NMEC+ARG+BRA+BGR+CHN+COL+CRI+HRV+CYP+IND+IDN+MLT+ROU+RUS+SAU+ZAF.B1_GA.C/all?startTime=2012&endTime=2018&dimensionAtObservation=allDimensions";
  var areas = "areas.json";

  var requests = [d3.json(gdp), d3.json(purchasingPowerParities), d3.json(areas)];

  Promise.all(requests).then(function(response) {
      var dataset = transform(response);
      makescatterplot(dataset);
    }).catch(function(e){
        throw(e);
      });
}

// create function to transfrom the data
function transform(response){
  // extract GDP data & transform it
  gdp = response[0];
  gdp = transformResponseGDP(gdp);

  // extract PPP data & transform it
  ppp = response[1];
  ppp = transformResponsePPP(ppp);

  // extract areas data
  areas = response[2];

  // create dictionary to store values
  var dataset2012 = [];
  var dataset2016 = [];
  let counter = 0;

  // get PPP values for 2009
  Object.keys(ppp).forEach(function(key) {

    // remove outliers
    if (key == "Korea" || key == "Chile" || key == "Japan" || key == "Hungary" || key == "Iceland") {
    }

    // check if key exists in both datasets
    else if (key in gdp) {
      // define arrays
      dataset2012[counter] = [];
      dataset2016[counter] = [];

      // add country
      dataset2012[counter].push(key)
      dataset2016[counter].push(key)

      // add area to array
      Object.keys(areas).forEach(function(area) {
        if (areas[area].includes(key)) {
          dataset2012[counter].push(area)
          dataset2016[counter].push(area)
        }
      })

      // add PPP data to array
      for(let i = 0, l = ppp[key].length; i < l; i++) {
        if (ppp[key][i]['Time'] == '2012') {
          dataset2012[counter].push(ppp[key][i]['Datapoint'])
        }
        if (ppp[key][i]['Time'] == '2016') {
          dataset2016[counter].push(ppp[key][i]['Datapoint'])
        }
      }

      // add GDP data to array
      for(let i = 0, l = gdp[key].length; i < l; i++) {
        if (gdp[key][i]['Year'] == '2012') {
          dataset2012[counter].push(gdp[key][i]['Datapoint'])
        }
        if (gdp[key][i]['Year'] == '2016') {
          dataset2016[counter].push(gdp[key][i]['Datapoint'])
        }
      }
      counter +=1;
    }
    });

    return [dataset2012, dataset2016];
}

// create function that draws the scatterplot
function makescatterplot(dataset){

  // initialize everything
  var index = 1,
      data = dataset[index],
      year = 2016;

  // set dimensions
  var margin = {top: 70, right: 20, bottom: 95, left: 50},
      w = 800 - margin.left - margin.right,
      h = 600 - margin.top - margin.bottom,
      padding = 40;

  // set x & y scales & axes
  var xScale = d3.scaleLinear()
                  .domain([0, d3.max(data, function(d) {
                    return d[2];
                  })])
                  .range([padding, w - padding * 2]);

  var yScale = d3.scaleLinear()
                  .domain([0, d3.max(data, function(d) {
                    return d[3];
                  })])
                  .range([h - padding, padding]);

  var yAxis = d3.axisLeft(yScale).tickFormat(function(d){return d/1000000}),
      xAxis = d3.axisBottom(xScale);

  // create tip
  var tip = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .html(function(d) { return d[0]; });

  // create variable for color coding
  var keys = ["America", "Asia", "Europe", "MiddleEast", "Oceania"];

  var color = d3.scaleOrdinal()
              .domain(keys)
              .range(d3.schemeSet2);


  // create SVG element
  var svg = d3.select("body")
              .append("svg")
              .attr("width", w + margin.left + margin.right)
              .attr("height", h + margin.bottom + margin.top)
              .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // call tip
  svg.call(tip);

  // x axis
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + (h - padding) + ")")
		.call(xAxis)
  .append("text")
    .attr("class", "x label")
    .attr("x", w / 2)
    .attr("y", 0 + margin.bottom / 2)
    .style("text-anchor", "left")
    .style("fill", "black")
    .text("Purchasing Power Parities");

	// y axis
	svg.append("g")
		.attr("class", "y axis")
		.attr("transform", "translate(" + padding + ", 0)")
		.call(yAxis)
    .append("text")
      .attr("class", "y label")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left )
      .attr("x", 0 - h /2 )
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", "black")
      .text("GDP in Millions");

  // graph title
   svg.append("text")
       .attr("x", (w / 2))
       .attr("y", 0 - (margin.top / 10 ))
       .attr("text-anchor", "middle")
       .style("font-size", "16px")
       .style("text-decoration", "underline")
       .text("GDP vs PPP");


  // legend
  var legend = svg.selectAll(".legend")
      .data(keys)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  // draw legend colored rectangles
  legend.append("rect")
        .attr("x", w - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);


  // print legend text
  legend.append("text")
        .attr("x", w - 20)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) {
          return d;
        });


  // draw circles
  svg.selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", function(d) {
          return xScale(d[2]);
        })
        .attr("cy", function(d) {
          return h - yScale(d[3]);
        })
        .attr("r", 5)
        .attr("fill", function(d) {
            var c = color(d[1]);
            return c;
          })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

    // print year label
    svg.select("text")
        .attr("x", 0 + (margin.left * 13))
        .attr("y", 0 + (margin.bottom * 1.3))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("text-decoration", "bold")
        .text("Year "+year);

  // create button to change year
   d3.select("body").append("button")
       .text("change year")
       .on("click",function(){
           //select new data
           if (index==0) {
               index=1;
              year = 2016;
           } else   {
               index=0;
               year = 2012;
           }
            //rejoin data
            var circle = svg.selectAll("circle")
                    .data(dataset[index]);

            // remove and redraw circles
            circle.exit()
                  .remove();
            circle.enter()
                  .append("circle")
                  .attr("r",0);

             // update all circles to new positions
             circle.transition()
                 .duration(500)
                 .attr("cx", function(d) {
                     return xScale(d[2]);
                   })
                   .attr("cy", function(d) {
                     return h - yScale(d[3]);
                   })
                   .attr("r", 5);

            // print year label
             svg.select("text")
             .attr("x", 0 + (margin.left * 13))
             .attr("y", 0 + (margin.bottom * 1.3))
             .attr("text-anchor", "middle")
             .style("font-size", "16px")
             .style("text-decoration", "bold")
             .text("Year "+year);

       });
      }
