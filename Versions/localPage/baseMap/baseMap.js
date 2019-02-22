"use strict";

//global variables:
var userSelected = "OUTAGES";
var geojson;
var map;
// control that shows state info on hover
var info = L.control();

//Main
window.onload = function () {
    renderMainMap();
    document.body.scroll(0, 0);
}

function renderMainMap() {

    map = L.map('map').setView([39.950647, -83.4324972], 8);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
      maxZoom: 18,
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id: 'mapbox.streets'
    }).addTo(map); 
    
    geojson = L.geoJson(statesData, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);
    
	L.tileLayer.wms("https://nowcoast.noaa.gov/arcgis/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer/WmsServer", {
      layers: '1',
      format: 'image/png',
      transparent: true,
      opacity: 0.5,
      attribution: 'NOAA'
    }).addTo(map);

    info.addTo(map);

    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 10, 15, 20, 25, 30, 35, 40, 45, 50],
            labels = [userSelected],
            from, to;

        for (var i = 0; i < grades.length; i++) {
            from = grades[i];
            to = grades[i + 1];

            labels.push(
                '<i style="background:' + getColor(from + 1) + '"></i> ' +
                from + (to ? '&ndash;' + to : '+'));
        }

        div.innerHTML = labels.join('<br>');
        return div;
    };

    legend.addTo(map);
}

//When adding the info
info.onAdd = function (map) {
    //"this" returns to info. 
    this._div = L.DomUtil.create('div', 'info');
    //the following line calls info.update(properties) function. Again, this refers to 'info' here
    this.update();
    return this._div;
};

//Update the info based on what state user has clicked on
info.update = function (properties) {
    this._div.innerHTML = '<h4># ' + userSelected + '</h4>' + (properties ?
        '<b>' + 'District & Grid ID: ' + properties.DIST_NAME + ':' + properties.GRIDID + '</b><br />' + properties.OUTAGES + ' ' + userSelected
        : 'Hover over a state');
};

// get color depending on selected variable value
function getColor(d) {
    return d > 50 ? '#800026' :
        d > 45 ? '#bd0026' :
            d > 40 ? '#e31a1c' :
                d > 35 ? '#fc4e2a' :
                    d > 30 ? '#fd8d3c' :
                        d > 25 ? '#feb24c' :
                            d > 20 ? '#fed976' :
                                d > 15 ? '#ffeda0' :
                                    d > 10 ? '#ffffcc' :
                                        '#ffffe5';
}

//return selected variable
function selectedVariable(properties) {
    if (userSelected == "OUTAGES") {
        return properties.OUTAGES
    } else if (userSelected == "LINES_DOWN") {
        return properties.LINES_DOWN
    } else if (userSelected == "WIND_SPEED") {
        return properties.WIND_SPEED
    }
}

function style(feature) {
    return {
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.6,
        fillColor: getColor(selectedVariable(feature.properties))
    };
}

function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.6
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }

    info.update(layer.feature.properties);
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);

    info.update();
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });
}

function showHideGrid() {
    var x = document.getElementById("grid");
    var y = document.getElementById("pager");
    if (x.style.display === "none" || y.style.display === "none") {
        x.style.display = "block";
        y.style.display = "block";
    } else {
        x.style.display = "none";
        y.style.display = "none";
    }
}

function nextVariable() {
    if (userSelected == "OUTAGES") {
        userSelected = "LINES_DOWN";
        map.remove();
        renderMainMap();
    } else if (userSelected == "LINES_DOWN") {
        userSelected = "WIND_SPEED";
        map.remove();
        renderMainMap();
    } else if (userSelected == "WIND_SPEED") {
        userSelected = "OUTAGES";
        map.remove();
        renderMainMap();
    }
}