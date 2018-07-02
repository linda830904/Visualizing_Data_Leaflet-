// Storing API endpoint into queryURL
var earthquakeURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson"
var tectonicPlatesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

// Get data
d3.json(earthquakeURL, function(data) {
    createFeatures(data.features);
});
// Define function to run on each feature 
function createFeatures(earthquakeData) {
    var earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: function(feature, layer) {
            layer.bindPopup("<h3>Magnitude: " + feature.properties.mag +"</h3><h3>Location: "+ feature.properties.place +
              "</h3><hr><p>" + new Date(feature.properties.time) + "</p>");
          },

          pointToLayer: function (feature, latlng) {
            return new L.circle(latlng,
              {radius: getRadius(feature.properties.mag),
              fillColor: getColor(feature.properties.mag),
              fillOpacity: .6,
              color: "#000",
              stroke: true,
              weight: .8
          })
        }
        });

    createMap(earthquakes);
}

function createMap(earthquakes) {

    // Define map layers
    var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/sharonsu94/cjfaejrjk64vi2so639ehc5k0/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoic2hhcm9uc3U5NCIsImEiOiJjamV2b3AxaWQwcDc5MzJwc2o0ZjhlNzR1In0." +
    "VjlbqszIZOjTP0T1d-Y9Aw");
  
    var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/sharonsu94/cjfael7sy04en2rlm9nb8uyvq/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoic2hhcm9uc3U5NCIsImEiOiJjamV2b3AxaWQwcDc5MzJwc2o0ZjhlNzR1In0." +
    "VjlbqszIZOjTP0T1d-Y9Aw");

    var lightMap = L.tileLayer("https://api.mapbox.com/styles/v1/sharonsu94/cjfaegj8s03ls2sphts1zdr4q/tiles/256/{z}/{x}/{y}?" +
    "access_token=pk.eyJ1Ijoic2hhcm9uc3U5NCIsImEiOiJjamV2b3AxaWQwcDc5MzJwc2o0ZjhlNzR1In0." +
    "VjlbqszIZOjTP0T1d-Y9Aw");
    
      // Define base maps
    var baseMaps = {
        "Light Map": lightMap,
        "Outdoors": outdoors,
        "Satellite": satellite
    };

    // Create tectonic layer
    var tectonicPlates = new L.LayerGroup();

    // Create overlay object to hold overlay layer
    var overlayMaps = {
        "Earthquakes": earthquakes,
        "Tectonic Plates": tectonicPlates
    };

    // Create our map
    var myMap = L.map("map", {
        center: [40.7, -94.5],
        zoom: 3,
        layers: [lightMap, earthquakes, tectonicPlates]
    });

    // Add tectonic plates data
    d3.json(tectonicPlatesURL, function(tectonicData) {
        L.geoJson(tectonicData, {
            color: "yellow",
            weight: 2
        })
        .addTo(tectonicPlates);
    });

    //Add layer control to map
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Create legend
    var legend = L.control({
        position: "bottomright"
    });

    legend.onAdd = function(myMap) {
        var div = L.DomUtil.create("div", "info legend"),
        grades = [0, 1, 2, 3, 4, 5],
        labels = [];

    // Create legend
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }
    return div;
    };
    legend.addTo(myMap);
}

// Create color function
function getColor(magnitude) {
    if (magnitude > 5) {
        return 'red'
    } else if (magnitude > 4) {
        return 'orange'
    } else if (magnitude > 3) {
        return 'yellow'
    } else if (magnitude > 2) {
        return 'lightgreen'
    } else if (magnitude > 1) {
        return 'green'
    } else {
        return '#58C9CB'
    }
};

//Create radius function
function getRadius(magnitude) {
    return magnitude * 25000;
};