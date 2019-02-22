// $(function(){
//   $(window).resize(adjust);
//   function adjust(){
//     var offset = $(window).height() - 50;
//     $('#map').height(offset);
//   }
//   adjust();
// });


function queryJSON(json, param) {
    // var ds = [['Index', 'Result']];
    var ds = new Keen.Dataset();
    $.each(json, function(i, v) {
        $.each(v, function(district, data) {
            ds.appendRow('District ' + district, [parseFloat(data.Prob_Storm_Day)])
        })
    });
    return ds
}

function queryDistricts(json) {
    var districts = [];
    $.each(json, function(i, v) {
        $.each(v, function (district, dataset) {
            $.each(dataset, function (head, data) {
                if (head == "District") {
                    districts.push('District ' + data);
                }
            });
        });
    });

    return districts;

}

function queryJSONTable(json) {
    var ds = [];
    var headers = ['District'];
    $.each(json, function(i, v) {
        $.each(v, function(district, dataset) {
            var vals = [];
            $.each(dataset, function(head, data) {
                if (head == "District") {
                    vals.push(data);
                }
            });
            $.each(dataset, function(head, data) {
                if (head != "District") {
                    if (!headers.includes(head)) {
                        headers.push(head)
                    }
                    vals.push(data);
                }
                });
            ds.push(vals)
            })
        });
    ds.unshift(headers);
    return ds
}

function getFutureDates() {

    var start = new Date();
    var end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 5);

    var getDaysArray = function(start, end) {
        for(var arr=[],dt=start; dt<=end; dt.setDate(dt.getDate()+1)){
            arr.push(new Date(dt).toLocaleDateString());
        }
        return arr;
        };

    var daylist = getDaysArray(start, end);

    return daylist;

}

function randomOutageProb(json) {
    var arr = [];
    var districts = queryDistricts(json);
    var futureDates = getFutureDates();
    $.each(futureDates, function(i, date) {
        var vals = [date];
        $.each(districts, function(district) {
            vals.push((Math.random() * 100).toFixed(2));
        });
        arr.push(vals)
    });
    districts.unshift("Index");
    arr.unshift(districts);

    return arr;
}


Keen.ready(function(){

    var today = new Date();


    refreshButton = document.getElementById('refresh');
    selectedDate = document.getElementById('timeframe-end').value;

    var dd = today.getDate();
    var mm = today.getMonth() + 1; //January is 0!
    var yyyy = today.getFullYear();

    if(dd<10) {
        dd = '0'+dd
    }

    if(mm<10) {
        mm = '0'+mm
    }

    today = mm + '/' + dd + '/' + yyyy;


    $(refreshButton).click(function() {
            location.reload();
    });

    $.getJSON('/api/sce/' + yyyy + "/" + mm + "/" + dd + '/15?format=json', function(json) {

        console.log(json);

        queryJSON(json, "Prob_Storm_Day");

        $.getJSON('/api/geojson/sce', function(geojson){

            function getColor(d) {
                return d > 90 ? '#410012' :
                       d > 80 ? '#58001e' :
                       d > 70 ? '#800026' :
                       d > 60  ? '#BD0026' :
                       d > 50  ? '#E31A1C' :
                       d > 40  ? '#FC4E2A' :
                       d > 30   ? '#FD8D3C' :
                       d > 20   ? '#FEB24C' :
                       d > 10   ? '#FED976' :
                                '#FFEDA0'

            }

            function style(json) {
                return {
                    fillColor: getColor(json.Prob_Storm_Day),
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    dashArray: '3',
                    fillOpacity: 0.7
                };
            }

            var map = L.map('map').setView([34.0522, -118.2437], 6);

            L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
                // id: 'mapbox.streets',
                id: "mapbox.light",
                accessToken: 'pk.eyJ1Ijoic2NvdHRodWxsIiwiYSI6ImNqa2MzNWxleTJzdnQzd3BheTJ5NmQ0amMifQ.xNW_0a0SO1_zD6mpq8FHqg'
            }).addTo(map);

            var polygons = L.geoJSON(geojson)
                .addTo(map)
                .eachLayer(function(layer){
                    var dist = layer.feature.properties.DISTRICT;
                    for (i in json){
                        for (key in json[i]) {
                            if (key == dist){
                                layer.setStyle(style(json[i][key]));
                                layer.bindPopup("District " + key);
                                layer.on('mouseover', function (e) {
                                    this.openPopup();
                                    this.setStyle({fillOpacity :0.9})
                                });
                                layer.on('mouseout', function (e) {
                                    this.closePopup();
                                    this.setStyle({fillOpacity :0.7})
                                });
                            }
                        }
                    }
                    });

            var legend = L.control({position: 'bottomright'});

                legend.onAdd = function (map) {

                    var div = L.DomUtil.create('div', 'info legend'),
                    grades = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90],
                    labels = [];

                    // loop through our density intervals and generate a label with a colored square for each interval
                    for (var i = 0; i < grades.length; i++) {
                        div.innerHTML +=
                            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
                    }
                    return div;
                    };

            legend.addTo(map);


            }
            );

        var RAND_DATA_MAX = 50;

    function makeGroupedDataset(){
        var ds = new Dataset();
        var len = 8;
        for (var i = 0; i < len; i++) {
          ds.appendRow(faker.internet.email(), [faker.random.number()]);
        }
        // ds.appendRow('null', [faker.random.number()]);
        return ds;
      }

      function makeGroupedIntervalDataset(){
        var ds = new Dataset();
        ds.matrix = [
          [ 'Index' ],
          [ '2015-12-01T10:56:00.000Z' ],
          [ '2015-12-01T10:57:00.000Z' ],
          [ '2015-12-01T10:58:00.000Z' ],
          [ '2015-12-01T10:59:00.000Z' ],
          [ '2015-12-01T11:00:00.000Z' ]
        ];


        function gen(n){
                var arr = [ faker.internet.exampleEmail() ];
                for (var i = 0; i < n; i++) {
                  arr.push(Math.random(0, 1000));
                }
                return arr;
              }
        var len = ds.selectColumn(0).length;
        for (var i = 0; i < RAND_DATA_MAX; i++) {
          var newCol = gen(len-1);
          if (i > 0) {
            ds.appendColumn(newCol[0], newCol.slice(1));
          }
          else {
            // Inject a null value
            ds.appendColumn('null', newCol.slice(1));
          }
        }
        return ds;
      }

    var gaugeData = [
        [ 'Index', 'Value' ],
        [ 'Outage Probability', (Math.random() * 100).toFixed(2) ]
      ];


    var chart01 = new Keen.Dataviz()
        .height(240)
        .el('#chart-01')
        // .title("District")
        // .theme('custom-theme')
        .type('gauge')
        // .chartOptions({})
        .call(function(){
          this.dataset.matrix = gaugeData;
        })
        .chartOptions({
            transition: {
                duration: 3000
              }
        })
        .render();

    var chart02 = new Keen.Dataviz()
        .height(260)
        .el('#chart-02')
        // .title('Mmmm, donuts...')
        .type('donut')
        .chartOptions({})
        .data(queryJSON(json, 'Undergrounds'))
        .sortGroups('desc')
        .chartOptions({
            transition: {
                duration: 3000
              }
        })
        .render();

    var table01 = new Keen.Dataviz()
        .el('#table')
        // .theme('custom-theme')
        .height(300)
        .type('table')
        // .title('Basic table view')
        // .notes('Footnotes for this table')
        .call(function() {
            this.dataset.matrix = queryJSONTable(json)
        })
        .chartOptions({
            transition: {
                duration: 3000
              }
        })
        .render();

    chart03 = new Dataviz()
        .height(400)
        .el('#chart-03')
        .type('line')
        .stacked(false)
        .call(function() {
            this.dataset.matrix = randomOutageProb(json)
        })
        // .sortGroups('desc')
        .chartOptions({
                axis:{
                    x: {
                        label: {
                            show: true,
                            text: "Date",
                            position: 'outer-center'
                        }
                    },
                    y: {
                        label: {
                            show: true,
                            text: "Outage Probability (%)",
                            position: 'outer-middle'
                        }
                    }},
                transition: {
                    duration: 3000
                  }
        })
        .render();
    }
    );



  // ----------------------------------------
  // Violations line chart
  // ----------------------------------------

  //
  //
  // // ----------------------------------------
  // // Hourly Actions
  // // ----------------------------------------
  // var chart02 = new Keen.Dataviz()
  //   .el('#chart-03')
  //   .height(250)
  //   .type('bar')
  //   .title('Hourly Actions')
  //   .stacked(true)
  //   .prepare();
  //
  // client
  //   .query('count', {
  //     event_collection: 'impressions',
  //     group_by: 'ad.advertiser',
  //     interval: 'hourly',
  //     timeframe: {
  //       start: '2014-05-04T00:00:00.000Z',
  //       end: '2014-05-05T00:00:00.000Z'
  //     }
  //   })
  //   .then(function(res) {
  //     chart02.data(res).render();
  //   })
  //   .catch(function(err) {
  //     chart02.message(err.message);
  //   });
  //
  // // ----------------------------------------
  // // Violations by Officer
  // // ----------------------------------------
  // var chart03 = new Keen.Dataviz()
  //   .el('#chart-05')
  //   .height(250)
  //   .type('bar')
  //   .title('Actions by Officer')
  //   .stacked(true)
  //   .prepare();
  //
  // client
  //   .query('count', {
  //     event_collection: 'pageviews',
  //     interval: 'hourly',
  //     timeframe: {
  //       start: '2014-04-30T12:00:00.000Z',
  //       end: '2014-05-05T00:00:00.000Z'
  //     }
  //   })
  //   .then(function(res) {
  //     chart03.data(res).render();
  //   })
  //   .catch(function(err) {
  //     chart03.message(err.message);
  //   });
});