let lga_totals;

function populateSide(region) {
    console.log(region)
    $("#reg-name").text(region.LGA_NAME20)
    $("#reg-lgacode").text(region.LGA_CODE20)
}

fetch('./data/lga_totals.json')
    .then(response => response.json())
    .then(data => {
        lga_totals = data
        lgas = data.map(i => i.LGACode)
        console.log(lgas)
        fetch('./data/lga_map.geojson')
            .then(response => response.json())
            .then(data => {
                data = data.features.map(lga => {
                    if(lgas.includes(lga.properties.LGA_CODE20)) {
                        lga.properties.total = lga_totals.filter(i => i.LGACode == lga.properties.LGA_CODE20)[0].total
                    } else {
                        lga.properties.total = NaN
                    }
                    return lga
                })
                let getColor = v => {
                    return  v > 1000 ? '#800026' :
                            v > 500  ? '#BD0026' :
                            v > 200  ? '#E31A1C' :
                            v > 100  ? '#FC4E2A' :
                            v > 50   ? '#FD8D3C' :
                            v > 20   ? '#FEB24C' :
                            v > 10   ? '#FED976' :
                                        '#FFEDA0';
                }

                let maxTotal = Math.max(...lga_totals.map(i => i.total))
                console.log(maxTotal)
                let map = L.map('map').setView([147.0967,-36.0406 ], 13),
                vector = L.geoJson(data, {
                    onEachFeature: (feature, layer) => {
                        let style;

                        
                        let zoomToFeature = (e) => {
                            // $("#map").css('width', '60%')
                            map.fitBounds(e.target.getBounds());
                            populateSide(e.target.feature.properties)
                        }

                        let highlightFeature = (e) => {
                            let layer = e.target;

                            layer.setStyle({
                                weight: 3,
                                color: '#777',
                                dashArray: '',
                                fillOpacity: 0.7
                            });
                            
                            layer.bindTooltip("<div><b>" + feature.properties.LGA_NAME20 + "</b><div>Total:<b>" + feature.properties.total + "</b></div></div>").openTooltip()

                            if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                                layer.bringToFront();
                            }

                        }

                        let resetHighlight = (e) => {
                            let layer = e.target;
                            layer.closeTooltip()
                            layer.setStyle({
                                fillColor: feature.properties.total ? getColor(feature.properties.total) : "#fff",
                                color: "#ccc",
                                weight: 1,
                                fillOpacity: 1
                            });
                            // data.resetStyle(layer)
                                
                        }         

                        if(feature.properties.total)  {
                            style = {
                                // fillColor: "rgba(0, 0, 200, " + (feature.properties.total/maxTotal).toFixed(2)  + ")",
                                // color: "rgba(0, 0, 200, " + (feature.properties.total/maxTotal).toFixed(2)  + ")"
                                fillColor: getColor(feature.properties.total),
                                // color: getColor(feature.properties.total),
                                weight: 1
                            }
                        } else {
                            style = {
                                fillColor: "#fff",
                                color: "#ccc",
                                // dashArray: "5",                                   
                            }
                        }
                        layer.setStyle(style)
                        layer.on({
                            mouseover: highlightFeature,
                            mouseout: resetHighlight,
                            click: zoomToFeature
                        });

                        
                    },
                    style: {
                        // color: "#EC5858",
                        color: "#ccc",
                        weight: 1,
                        // fillColor: "#fff",
                        fillColor: "#fff",
                        fillOpacity: 1
                    }
                }).addTo(map); 

                let legend = L.control({position: 'bottomleft'});

                legend.onAdd = function (map) {

                    var div = L.DomUtil.create('div', 'info legend'),
                        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
                        labels = [];
                
                    div.innerHTML +=
                        '<i style="background-color:#fff"></i> ' +
                        'Data Not Available <br>';

                    // loop through our density intervals and generate a label with a colored square for each interval
                    for (var i = 0; i < grades.length; i++) {
                        div.innerHTML +=
                            '<i style="background-color:' + getColor(grades[i] + 1) + '"></i> ' +
                            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+' );
                    }
                    
                    return div;
                };

                legend.addTo(map);

                let myIcon = L.icon({
                    iconUrl: './img/placemarker.png',
                    iconSize: [25, 25],
                    
                });

                L.marker([-33.8688, 151.2093], {
                    icon: myIcon,
                    riseOnHover: true,
                    title: "Sydney"
                }).addTo(map)
                L.marker([-27.4705, 153.0260], {
                    icon: myIcon,
                    riseOnHover: true,
                    title: "Brisbane"
                }).addTo(map)
                L.marker([-28.0167, 153.4000], {
                    icon: myIcon,
                    riseOnHover: true,
                    title: "Gold Coast"
                }).addTo(map)
                L.marker([-37.8136, 144.9631], {
                    icon: myIcon,
                    riseOnHover: true,
                    title: "Melbourne"
                }).addTo(map)
                L.marker([-16.9203, 145.7710], {
                    icon: myIcon,
                    riseOnHover: true,
                    title: "Cairns"
                }).addTo(map)
                L.marker([-31.9523, 115.8613], {
                    icon: myIcon,
                    riseOnHover: true,
                    title: "Perth"
                }).addTo(map)
                L.marker([-32.9283, 151.7817], {
                    icon: myIcon,
                    riseOnHover: true,
                    title: "Newcastle"
                }).addTo(map)
            
                map.fitBounds(vector.getBounds());
                // vector.bindPopup(function (layer) {
                //     return layer.feature.properties.description;
                // }) 
            })
            .catch(error => console.log(error));
    })

tickcases("tickcasecompoverall", "tickcasetypemonth", "tickoverall")
tickcases("tickcasecompstate", "tickcasetypemonth", "tickstate")
tickcases("tickcasecompregion", "tickcasetypemonth", "tickregions")