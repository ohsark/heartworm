let SELECTED_AREAS = []

//////// Event Handlers for Tick cases
// $("input[name='tickcasecomp']").change(e => {
//     tickcasecomp = $(e.target).attr('id')
//     tickcases(tickcasecomp)
// })

// $("input[name='tickcasecomp']").change(e => {
//     tickcasecomp = $(e.target).attr('id')
//     tickcases(tickcasecomp)
// })

$("#selectedregions").on("click", "label", e  => {
    _updateSelection({
        "areaname": e.target.getAttribute("data-areaname"),
        "area": e.target.getAttribute("data-area")
    })
})

$("#regionselectoptions").on("click", "h6", e  => {
    _updateSelection({
        "areaname": e.target.getAttribute("data-areaname"),
        "area": e.target.getAttribute("data-area")
    })
})

$("#nonareabuttons").on("change", "input[name='mainareachange']", e => {
    _updateSelection({
        "areaname": e.target.getAttribute("data-areaname"),
        "area": e.target.getAttribute("data-area")
    })
})

function _updateSelection(region) {
    if(!SELECTED_AREAS.some(r => r.area == region.area)) {
        SELECTED_AREAS.push(region)
    } else {
        SELECTED_AREAS = SELECTED_AREAS.filter(r => r.area != region.area)
    }
    console.log(SELECTED_AREAS)
    _refreshStratsDS()
    _updateChartsDS()
}

function _updateChartsDS() {

    let dim = getdim("#tickcasescontainer")

    fetch("./data/areasummaries.json")
        .then(response => response.json())
        .then(data => {
            let tsDSobs = [],
                tsDStrend = [], 
                tsDScum = []
            
            data
                .filter(a => SELECTED_AREAS.some(r => a.area == r.area))
                .forEach(d => {
                    tsDSobs.unshift(...d.tsDSobs.map(e => ({ ...e, strat : d.areaname ? d.areaname : d.area})))
                    tsDStrend.unshift(...d.tsDStrend.map(e => ({ ...e, strat : d.areaname ? d.areaname : d.area})))
                    tsDScum.unshift(...d.tsDScum.map(e => ({ ...e, strat : d.areaname ? d.areaname : d.area})))
                })

            console.log(tsDSobs)
            
            MultiLineChart(tsDSobs, {
                x: d => new Date(d.date),
                y: d => d.n,
                z: d => d.strat,
                height: dim.width *0.5, 
                width: dim.width ,
                color: "#4e79a7",
                div: "#tickcasesobs",
                xLabel: "Date →",
                yLabel: "↑ Total",
            })
    
            MultiLineChart(tsDStrend, {
                x: d => new Date(d.date),
                y: d => d.n,
                z: d => d.strat,
                height: dim.width *0.5, 
                width: dim.width ,
                color: "#4e79a7",
                div: "#tickcasestrend",
                xLabel: "Date →",
                yLabel: "↑ Total",
            })
    
            MultiLineChart(tsDScum, {
                x: d => new Date(d.date),
                y: d => d.n,
                z: d => d.strat,
                height: dim.width *0.5, 
                width: dim.width ,
                color: "#4e79a7",
                div: "#tickcasescum",
                xLabel: "Date →",
                yLabel: "↑ Total",
            })
        })

        
}

function initialize_areafilters(areas) {
    areas.forEach(r => {
        if(r.areatype == "LGA") {
            $("#regionselectoptions").append(`
                <h6 class="px-2 dropdown-item" style="cursor:pointer" data-area="${r.area}" data-areaname="${r.areaname}"> ${r.areaname + ", " + r.areastate + ", " + r.area}</h6>
            `)
        } else {
            // $("#nonareabuttons").append(`
            //     <label class="btn active btn-outline-dark no-focus btn-sm rounded-pill px-2 py-1 font-weight-bold mb-2">
            //         <input type="checkbox" name="mainareachange" data-areaname="NonLGA" data-area="${r.area}"> ${r.area}
            //     </label>
            // `)
            $("#nonareabuttons").append(`
                <label class="btn btn-outline-dark no-focus btn-sm rounded-pill px-2 py-1 font-weight-bold mb-2">
                    <input type="checkbox" name="mainareachange" data-areaname="NonLGA" data-area="${r.area}" ${r.area == "All Australia" ? "checked" : ""}> ${r.area}
                </label>
            `)
            if(r.area == "All Australia") {
                _updateSelection({
                    "areaname": "NonLGA",
                    "area": r.area
                })
            }
        }
        // _updateChartsDS()
    })
}

function _refreshStratsDS() {
    $("#selectedregions").empty()
    SELECTED_AREAS.forEach(r => {
        if(r.areaname != "NonLGA") {
            $("#selectedregions").append(`
                <label 
                    class="selectedregion btn active btn-outline-dark no-focus btn-sm rounded-pill px-2 py-1 font-weight-bold mb-2"
                    data-area="${r.area}"
                    data-areaname="${r.areaname}">
                        ${r.areaname}
                </label>
            `)
        }
    })
}

fetch('./data/areasummaries.json')
    .then(response => response.json())
    .then(data => {
        lga_totals = data
        lgas = data.map(i => i.area)
        initialize_areafilters(data.map(i => {
            return {
                area: i.area,
                areatype: i.areaytype,
                areaname: i.areaname,
                areastate: i.areastate,
            }
        }))
        fetch('./data/lga_map.geojson')
            .then(response => response.json())
            .then(data => {
                data = data.features.map(lga => {
                    if(lgas.includes(lga.properties.LGA_CODE20)) {
                        lga.properties.total = lga_totals.filter(i => i.area == lga.properties.LGA_CODE20)[0].totalDS
                    } else {
                        lga.properties.total = NaN
                    }
                    // lga.properties.state = lga_totals.filter(i => i.lga_code == lga.properties.LGA_CODE20)[0].state
                    return lga
                })
                let getColor = v => {
                    return  v > 10000 ? '#800026' :
                            v > 5000  ? '#BD0026' :
                            v > 2000  ? '#E31A1C' :
                            v > 1000  ? '#FC4E2A' :
                            v > 500   ? '#FD8D3C' :
                            v > 200   ? '#FEB24C' :
                            v > 100   ? '#FED976' :
                                        '#FFEDA0';
                }

                let maxTotal = Math.max(...lga_totals.map(i => i.total))
                console.log(maxTotal)
                let map = L.map('map', {
                    zoomControl: false
                })
                vector = L.geoJson(data, {
                    onEachFeature: (feature, layer) => {
                        let style;

                        
                        let zoomToFeature = (e) => {
                            map.fitBounds(e.target.getBounds());
                            _updateSelection({
                                "area": e.target.feature.properties.LGA_CODE20, 
                                "areaname": e.target.feature.properties.LGA_NAME20
                            })
                        }

                        let highlightFeature = (e) => {
                            let layer = e.target;

                            layer.setStyle({
                                weight: 2,
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
                            // data.resetsDStyle(layer)
                                
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
                        grades = [0, 100, 200, 500, 1000, 2000, 5000, 10000],
                        labels = [];
                
                    div.innerHTML +=
                        '<div class="mb-1"><b style="font-size:0.825rem">Count Range</b></div>' +
                        '<i class="border" style="background-color:#fff"></i> ' +
                        'Data Not Available <br>';

                    // loop through our density intervals and generate a label with a colored square for each interval
                    for (var i = 0; i < grades.length; i++) {
                        div.innerHTML +=
                            '<i class="border" style="background-color:' + getColor(grades[i] + 1) + '"></i> ' +
                            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+' );
                    }
                    
                    return div;
                };

                legend.addTo(map);

                // let myIcon = L.icon({
                //     iconUrl: './img/placemarker.png',
                //     iconSize: [25, 25],
                    
                // });
                let myIcon = title => {
                    let icon = new L.DivIcon({
                        className: 'name-text',
                        html: `<svg overflow="visible" xmlns="http://www.w3.org/2000/svg">
                                    <text overflow="visible" y="12" >${title}</text>
                                </svg>`
                    })
                    return icon
                }
            
                L.marker([-33.8688, 151.2093], {
                    icon: myIcon("Sydney"),
                    // riseOnHover: true,
                    // title: myIcon("Sydney")
                }).addTo(map)
                L.marker([-27.4705, 153.0260], {
                    icon: myIcon("Brisbane"),
                    // riseOnHover: true,
                    // title: myIcon("Brisbane")
                }).addTo(map)
                L.marker([-28.0167, 153.4000], {
                    icon: myIcon("Gold Coast"),
                    // riseOnHover: true,
                    // title: myIcon("Gold Coast")
                }).addTo(map)
                L.marker([-37.8136, 144.9631], {
                    icon: myIcon("Melbourne"),
                    // riseOnHover: true,
                    // title: myIcon("Melbourne")
                }).addTo(map)
                L.marker([-16.9203, 145.7710], {
                    icon: myIcon("Cairns"),
                    // riseOnHover: true,
                    // title: myIcon("Cairns")
                }).addTo(map)
                L.marker([-31.9523, 115.8613], {
                    icon: myIcon("Perth"),
                    // riseOnHover: true,
                    // title: myIcon("Perth")
                }).addTo(map)
                L.marker([-32.9283, 151.7817], {
                    icon: myIcon("Newcastle"),
                    // riseOnHover: true,
                    // title: myIcon("Newcastle")
                }).addTo(map)

                // .setView([147.0967,-36.0406 ], 13)
            
                map.fitBounds(L.latLngBounds([
                    [-27, 148],
                    [-34, 154]
                ]));

                L.control.zoom({
                    position: 'bottomright'
                }).addTo(map);
                console.log(map.getBounds())
                // vector.bindPopup(function (layer) {
                //     return layer.feature.properties.description;
                // }) 
            })
            .catch(error => console.log(error));
    })

function tickcases(tickcasecomp) {

    let dim = getdim("#tickcasescontainer")

    // fetch("./data/areasummaries.json")
    //     .then(response => response.json())
    //     .then(data => {
    //         let tsDSobs = data.filters(a => SELECTED_AREAS.includes(a.areaname)).forEach(d => {

    //         })
    //         // let tsDStrend = 
    //         // let tsDScum = 
    //     })

    fetch("./data/" + tickcasecomp + "_yearly_cases.json")
        .then(response => response.json())
        .then(data => {
            linechart(data, {
                x: d => new Date(d.date),
                y: d => d.n,
                z: d => d.strat,
                height: dim.width *0.4, 
                width: dim.width ,
                color: "#4e79a7",
                div: "#tickcasesobs",
                xLabel: "Date →",
                yLabel: "↑ Total",
            })

        })

    fetch("./data/" + tickcasecomp + "_monthly_cases.json")
        .then(response => response.json())
        .then(data => {
            linechart(data, {
                x: d => new Date(d.date),
                y: d => d.n,
                z: d => d.strat,
                height: dim.width *0.4,
                width: dim.width,
                color: "#4e79a7",
                div: "#tickcasestrend",
                xLabel: "Date →",
                yLabel: "↑ Total",
            })

        })

    fetch("./data/" + tickcasecomp + "_cumulative_cases.json")
        .then(response => response.json())
        .then(data => {
            linechart(data, {
                x: d => new Date(d.date),
                y: d => d.n,
                z: d => d.strat,
                height: dim.width *0.4,
                width: dim.width ,
                color: "#4e79a7",
                div: "#tickcasescum",
                xLabel: "Date →",
                yLabel: "↑ Total",
            })

        })
    
}