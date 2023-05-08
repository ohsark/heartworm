let lgadata = []
let regiondata, map

function setHeader(region, lga, state) {
    $("#regionselectheader").text(region + ", " + state)
    $("#regionselectlga").text(lga)
}

function populatepage(region) {

    lgadata = regiondata.filter(l => {
        if(l.lga == region) {
            return l
        }
    })[0]
    console.log(lgadata)
    setHeader(lgadata.region, lgadata.lga, lgadata.state)

    d3.select("#percentageworse").select("svg").remove()
    d3.select("#forecastspread").select("svg").remove()
    // d3.select("#forecastanomalies").select("svg").remove()
    d3.select("#thresholdprobability").select("svg").remove()


    // gauge("#gauge", 300, {value: Math.round(data[selected]["gauge"] * 100)})
    percentageworse({x:[1,2,3,4,5,6,7], y:[0,0.75,3,7,3,0.75,0]}, {
        x: "x",
        y: "y",
        width: getdim("#percentageworsecont").width,
        height: getdim("#percentageworsecont").width*0.8,
        percentage: String(lgadata["gauge"] * 100) + "%",
        color: "#4e79a7"  
    })

    // console.log(lgadata)

    if(lgadata["gauge"] < 0.4) {
        $("#increasechance").text("not likely (" + String(Math.round(lgadata["gauge"] * 100)) + "%)").css("color", "#4e79a7")
    } else if (lgadata["gauge"] > 0.4 && lgadata["gauge"] < 0.7) {
        $("#increasechance").text("probable (" + String(Math.round(lgadata["gauge"] * 100)) + "%)").css("color", "#f28e2c")
    } else {
        $("#increasechance").text("possible (" + String(Math.round(lgadata["gauge"] * 100)) + "%)").css("color", "#e15759")
    }
    
    $("#thresholdheading").text("3 or more cases?")
    thresholds({probs: lgadata["thresholds"][0], date: lgadata["t_month"]}, {
        x: "date",
        y: "probs",
        yFormat: "%",
        yLabel: "↑ Probability",
        // width: getdim("#thresholdcont").width,
        // height: getdim("#thresholdcont").height - 90,
        width: getdim("#thresholdprobability").width,
        height: getdim("#thresholdprobability").width *0.5,
        color: "#4e79a7"
    })
    
    forecast({forecast: lgadata["forecast"], date: lgadata["horizon"], obs: lgadata["observed"]}, {
        x : "date",
        y : "forecast",
        width: getdim("#forecastspread").width,
        height: getdim("#forecastspread").width*0.45,
        color: "#4e79a7",
        div: "#forecastspread",
        forecastdate: lgadata.last_train
    })

    // forecasttrend({trend: lgadata["trends"], date: lgadata["horizon"]}, {
    //     x : "date",
    //     y : "trend",
    //     yLabel: "↑ Monthly Total",
    //     width: getdim("#forecasttrendcont").width,
    //     height: getdim("#forecasttrendcont").height - 0,
    //     color: "#4e79a7",
    //     div: "#forecasttrend",
    //     forecastdate: new Date("2022-01-01")
    // })

    // forecastanomalies({forecast: lgadata["anomalies"], date: lgadata["horizon"]}, {
    //     x : "date",
    //     y : "forecast",
    //     width: getdim("#forecastanomalies").width,
    //     height: getdim("#forecastanomalies").width*0.15,
    //     color: "#4e79a7",
    //     div: "#forecastanomalies",
    //     forecastdate: lgadata.last_train
    // })

}

$("body").on("click", "div[aria-labelledby='region-selector'] a", e => populatepage(e.target.dataset.lga))
$("input[name='mapoptions']").change(e => {
    plotMap(e.target["value"] == "predictiverisk") 
})

$("input[id='inclforecast']").change(e => {
    let include = $(e.target).prop('checked')

    d3.select("#forecastspread").select("svg").remove()
    d3.select("#forecastanomalies").select("svg").remove()
    
    if(include) {
        forecast({forecast: lgadata["forecast"], date: lgadata["horizon"], obs: lgadata["observed"]}, {
            x : "date",
            y : "forecast",
            yLabel: "↑ Total",
            width: getdim("#forecastspread").width,
            height: getdim("#forecastspread").width*0.45,
            color: "#4e79a7",
            div: "#forecastspread",
            forecastdate: lgadata.last_train,
            forecast: true
        })
    
        // forecastanomalies({forecast: lgadata["anomalies"], date: lgadata["horizon"]}, {
        //     x : "date",
        //     y : "forecast",
        //     width: getdim("#forecastanomalies").width,
        //     height: getdim("#forecastanomalies").width*0.15,
        //     color: "#4e79a7",
        //     div: "#forecastanomalies",
        //     forecastdate: lgadata.last_train,
        //     forecast: true
        // })
    } else {
        forecast({forecast: lgadata["forecast"], date: lgadata["horizon"], obs: lgadata["observed"]}, {
            x : "date",
            y : "forecast",
            yLabel: "↑ Total",
            width: getdim("#forecastspread").width ,
            height: getdim("#forecastspread").width*0.45,
            color: "#4e79a7",
            div: "#forecastspread",
            forecastdate: lgadata.last_train
            
        })
    
        // forecastanomalies({forecast: lgadata["anomalies"], date: lgadata["horizon"]}, {
        //     x : "date",
        //     y : "forecast",
        //     // width: getdim("#forecastspread").width - 60,
        //     // height: getdim("#forecastspread").height*0.25,
        //     width: getdim("#forecastanomalies").width,
        //     height: getdim("#forecastanomalies").width*0.15,
        //     color: "#4e79a7",
        //     div: "#forecastanomalies",
        //     forecastdate: lgadata.last_train
        // })
    }
})

$("input[name='threshold']").change(e => {
    threshold = $(e.target).attr('id')
    let selection = 0

    switch(threshold) {
        case "thresholdone":
            $("#thresholdheading").text("3 or more cases?")
            selection = 0
            break;
        case "thresholdtwo":
            $("#thresholdheading").text("6 or more cases?")
            selection = 1
            break;
        case "thresholdthree":
            $("#thresholdheading").text("9 or more cases?")
            selection = 2
            break;
        case "thresholdfour":
            $("#thresholdheading").text("12 or more cases?")
            selection = 3
            break;
        default:
            selection = 0
    }

    d3.select("#thresholdprobability").select("svg").remove()
    // console.log(selection)
    thresholds({probs: lgadata["thresholds"][selection], date: lgadata["t_month"]}, {
        x: "date",
        y: "probs",
        yFormat: "%",
        yLabel: "↑ Frequency",
        // width: getdim("#thresholdcont").width,
        // height: getdim("#thresholdcont").height - 90,
        width: getdim("#thresholdprobability").width,
        height: getdim("#thresholdprobability").width*0.5,
        color: "#4e79a7"
    })
})

// fetch('./data/lga_totals_with_state.json')
//     .then(response => response.json())
//     .then(data => {
//         lga_totals = data
//         lgas = data.map(i => i.lga_code)
//         console.log(lgas)

plotMap = risk => {
    if(map) map.remove()
    $("#map").html('');
    fetch("./data/predictions.json")
        .then(response => response.json())
        .then(data => {
        
        regiondata = data
        selectedLGA = regiondata[0].lga
        lgas = regiondata.map(e => e.lga)

        fetch('./data/lga_map.geojson')
            .then(response => response.json())
            .then(data => {

                const parentNode = $("#map-container");
                parentNode.append('<div id="map"></div>');

                map = L.map('map', {
                    zoomControl: false
                })

                data = data.features.map(lga => {
                    if(lgas.includes(lga.properties.LGA_CODE20)) {
                        lga.properties.total = risk ? regiondata.filter(e => e.lga == lga.properties.LGA_CODE20)[0].risk :
                                                        regiondata.filter(e => e.lga == lga.properties.LGA_CODE20)[0].total
                        // lga.properties.total = lga_totals.filter(i => i.lga_code == lga.properties.LGA_CODE20)[0].total
                    } else {
                        lga.properties.total = NaN
                    }
                    // lga.properties.state = lga_totals.filter(i => i.lga_code == lga.properties.LGA_CODE20)[0].state
                    return lga
                })
               

                let getColor = v => {
                    if(risk) {
                        return  v <= 5 ? '#ffa1a1' :
                                v <= 10  ? '#ff9090' :
                                v <= 15  ? '#ff8080' :
                                v <= 20  ? '#ff7070' :
                                v <= 25   ? '#ff5f5f' :
                                v <= 30   ? '#ff4f4f' :
                                v <= 35   ? '#ff3f3f' :
                                v <= 40   ? '#ff2e2e' :
                                v <= 45   ? '#ff1e1e' :
                                v <= 50   ? '#ff0e0e' :
                                v <= 55   ? '#fc0000' :
                                v <= 60   ? '#ec0000' :
                                v <= 65   ? '#dc0000' :
                                v <= 70   ? '#c00' :
                                v <= 75   ? '#b00' :
                                v <= 80   ? '#ab0000' :
                                v <= 85   ? '#9b0000' :
                                v <= 90   ? '#8a0000' :
                                v <= 95   ? '#7a0000' :
                                            '#6a0000';
                        } else {
                            return  v > 1000 ? '#800026' :
                                    v > 500  ? '#BD0026' :
                                    v > 200  ? '#E31A1C' :
                                    v > 100  ? '#FC4E2A' :
                                    v > 50   ? '#FD8D3C' :
                                    v > 20   ? '#FEB24C' :
                                    v > 10   ? '#FED976' :
                                                '#FFEDA0';
                        }
                    
                }

                
                vector = L.geoJson(data, {
                    onEachFeature: (feature, layer) => {
                        let style;

                        
                        let zoomToFeature = (e) => {
                            // $("#map").css('width', '60%')
                            map.fitBounds(e.target.getBounds());
                            populatepage(e.target.feature.properties.LGA_CODE20)
                            setHeader(e.target.feature.properties.LGA_NAME20, e.target.feature.properties.LGA_CODE20, e.target.feature.properties.STE_NAME16)
                        }

                        let highlightFeature = (e) => {
                            let layer = e.target;

                            layer.setStyle({
                                weight: 2,
                                color: feature.properties.total ? getColor(feature.properties.total) : 'url(#repeat)',
                                dashArray: '',
                                color: "#00A7B970"
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
                                fillColor: feature.properties.total ? getColor(feature.properties.total) : 'url(#repeat)',
                                color: "#ddd",
                                weight: 1,
                                fillOpacity: 1
                            });
                            // data.resetStyle(layer)
                                
                        }         

                        if(feature.properties.total)  {
                            style = {
                                fillColor: getColor(feature.properties.total),
                                weight: 1
                            }
                        } else {
                            style = {
                                fillColor: 'url(#repeat)',
                                color: "#ddd",
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
                        color: "#eee",
                        weight: 1,
                        // fillColor: "#fff",
                        fillColor: "#fff",
                        fillOpacity: 1
                    }
                }).addTo(map); 

                let legend = L.control({position: 'bottomleft'});

                legend.onAdd = function (map) {

                    if(risk) {
                        var div = L.DomUtil.create('div', 'info-risk legend-risk')

                        div.innerHTML +=
                            '<div class="mb-1"><b style="font-size:0.825rem">Annual forecast relative risk</b></div>' +
                            `<div>
                                <div style="display:flex;justify-content: space-between; color: #555">
                                    <span> 0% </span>
                                    <span> 100% </span>
                                </div>
                            </div>`
    
                        // loop through our density intervals and generate a label with a colored square for each interval
                        for (var i = 1; i < 100; i+=5) {
                            div.innerHTML +=
                                '<i class="border-risk" style="background-color:' + getColor(i) + '"></i> ' 
                        }
    
                        div.innerHTML +=
                            // '<div class="mb-1"><b style="font-size:0.825rem">Count Range</b></div>' +
                            `<br><i class="border" style="background-image:repeating-linear-gradient(
                                -45deg,
                                transparent 0 1px,
                                rgb(204,204,204) 1px 3px
                                ); margin-right: 5px"></i> ` +
                            `Data Not Available <br>`

                    } else {
                        var div = L.DomUtil.create('div', 'info legend'),
                            grades = [0, 10, 20, 50, 100, 200, 500, 1000];
                    
                        div.innerHTML +=
                            '<div class="mb-1"><b style="font-size:0.825rem">Total observed cases</b></div>' +
                            '<i class="border" style="background-color:#fff"></i> ' +
                            'Data Not Available <br>';

                        // loop through our density intervals and generate a label with a colored square for each interval
                        for (var i = 0; i < grades.length; i++) {
                            div.innerHTML +=
                                '<i class="border" style="background-color:' + getColor(grades[i] + 1) + '"></i> ' +
                                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+' );
                        }
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
                        html: `<text overflow="visible" y="12" >${title}</text>`
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
                    [-26, 148],
                    [-34, 154]
                ]));

                L.control.zoom({
                    position: 'bottomright'
                }).addTo(map);

                let gradientString = `<linearGradient id="repeat" spreadMethod="repeat" x1="3%" y1="4%" x2="6%" y2="6%">
                                            <stop offset="0%" stop-color=${"#eee"} />
                                            <stop offset="25%" stop-color=${"#eee"} />
                                            <stop offset="25%" stop-color=${"#fff"} />
                                            <stop offset="100%" stop-color=${"#fff"} />
                                        </linearGradient>`

                // let repeatString = `<linearGradient id="repeat" xlink:href="#stripes"  />`
                
                let svg = document.getElementsByTagName('svg')[0];
                let svgDefs = document.createElementNS("http://www.w3.org/2000/svg", 'defs');
                svgDefs.insertAdjacentHTML('afterbegin', gradientString);
                // svgDefs.insertAdjacentHTML('afterbegin', repeatString);
                svg.appendChild(svgDefs); 
                
            })
            .catch(error => console.log(error));



        data.forEach(v => $("#regionselectoptions").append("<a class='dropdown-item text-left h6' data-lga='" + v.lga + "' href='#''>" + v.region + ", " + v.state + " - " + v.lga  +"</a>"))
        populatepage("31000")
    })
}