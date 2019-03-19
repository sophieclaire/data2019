/*
Sophie Stiekema,
10992499,
This file creates two linked graphs
*/

window.onload = jscode();

function jscode() {

  fetch("data.json")
    .then(response => response.json())
    .then(json => {
      console.log(json)
      // create countries array
      var data = {}
      for(let i = 1, l = Object.keys(json).length; i < l; i++) {
        data[json[i].Country] = json[i]["Quality of Life Index"];
        //console.log(json[i].Country)
      }
      console.log(data)
      const arrAvg = arr => arr.reduce((a,b) => a + b, 0) / arr.length
      var mean = arrAvg(Object.values(data));
      console.log(mean)
      var countries = Datamap.prototype.worldTopo.objects.world.geometries;
      console.log(countries)

      var less = [],
          more = [];

      // pair up countries from both datasets
      let replacekey = Object.keys(data).map((key) => {
        for (var i = 0, j = countries.length; i < j; i++) {
          if (countries[i].properties.name == key){
            // console.log(countries[i].properties.name);
            // console.log(key)
            // console.log(data[key])
            var newkey = countries[i].id
            return [newkey, data[key]]
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

      var paletteScale = d3.scale.linear()
            .domain([minValue,maxValue])
            .range(["#EFEFFF","#02386F"]);

      // fill dataSets
      replacekey.forEach(function(item){ //
        var country = item[0],
            index = item[1];
        dataset[country] = { numberOfThings: index, fillColor: paletteScale(index) };
    });

      // function addFillKey(data){
      //   for (var mapDatum in data){
      //     //console.log(data[mapDatum])
      //
      //     if (typeof(data[mapDatum]) !== "undefined") {
      //       var index = data[mapDatum].index;
      //       //console.log(data[mapDatum].Country)
      //       //console.log(index)
      //       if(index <= (.75 * mean)){
      //           data[mapDatum].fillKey = "lightBlue"
      //       }
      //       else if((.75 * mean) < index && index <= mean){
      //           data[mapDatum].fillKey = "justBlue"
      //       }
      //       else if (mean < index && index <= (1.25 * mean)){
      //           data[mapDatum].fillKey = "mediumBlue"
      //       }
      //       else {
      //         data[mapDatum].fillKey = "deepBlue"
      //       }
      //     }
      //   }
      // }
      // addFillKey(replacekey);

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
        }
    });

    // Draw a legend for this map
    map.legend();

    });
}
