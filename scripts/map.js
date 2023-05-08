fetch("./data/predictions.json")
            .then(response => response.json())
            .then(data => {
            
            regiondata = data
            selectedLGA = regiondata[0].lga
            lgas = regiondata.map(e => e.lga)

            fetch('./data/lga_map.geojson')
                .then(response => response.json())
                .then(data => {
                    data = data.features.map(lga => {
                        if(lgas.includes(lga.properties.LGA_CODE20)) {
                            lga.properties.total = regiondata.filter(e => e.lga == lga.properties.LGA_CODE20)[0].risk
                            // lga.properties.total = lga_totals.filter(i => i.lga_code == lga.properties.LGA_CODE20)[0].total
                        } else {
                            lga.properties.total = NaN
                        }
                        // lga.properties.state = lga_totals.filter(i => i.lga_code == lga.properties.LGA_CODE20)[0].state
                        return lga
                    })
                    // let getColor = v => {
                    //     return  v > 1000 ? '#800026' :
                    //             v > 500  ? '#BD0026' :
                    //             v > 200  ? '#E31A1C' :
                    //             v > 100  ? '#FC4E2A' :
                    //             v > 50   ? '#FD8D3C' :
                    //             v > 20   ? '#FEB24C' :
                    //             v > 10   ? '#FED976' :
                    //                         '#FFEDA0';
                    // }

                    let unavailablePatch = `<linearGradient id="stripes" x1="0%" y1="0%" x2="100%" y2="100%">
                                                <stop offset=0 stop-color=${'#333'}/>
                                                <stop offset=50% stop-color=${'#333'}/>
                                                <stop offset=50% stop-color=${'#fff'}/>
                                                <stop offset=100% stop-color=${'#fff'}/>
                                            </linearGradient>`

                    let getRiskColor = v => {
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
                    }

                    let map = L.map('map', {
                        zoomControl: false
                    })
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
                                    color: feature.properties.total ? getRiskColor(feature.properties.total) : 'url(#repeat)',
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
                                    fillColor: feature.properties.total ? getRiskColor(feature.properties.total) : 'url(#repeat)',
                                    color: "#ddd",
                                    weight: 1,
                                    fillOpacity: 1
                                });
                                // data.resetStyle(layer)
                                    
                            }         

                            if(feature.properties.total)  {
                                style = {
                                    fillColor: getRiskColor(feature.properties.total),
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
                                '<i class="border-risk" style="background-color:' + getRiskColor(i) + '"></i> ' 
                        }

                        div.innerHTML +=
                            // '<div class="mb-1"><b style="font-size:0.825rem">Count Range</b></div>' +
                            `<br><i class="border" style="background-image:repeating-linear-gradient(
                                -45deg,
                                transparent 0 1px,
                                rgb(204,204,204) 1px 3px
                              ); margin-right: 5px"></i> ` +
                            `Data Not Available <br>`
                        
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