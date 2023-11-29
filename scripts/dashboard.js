let SELECTED_AREA = []
let REGIONS_DATA = []
let AREA = {}
let GRAPH_SELECTED = 1

function setHeader(region) {
    $("#regionselectheader").text(region)
}

$("#regionselectoptions").on("click", "a", e  => {
    populatepage(e.target.getAttribute("data-postcode"))
})

$("#graphselectoroptions").on("click", "a", e  => {
    GRAPH_SELECTED = parseInt(e.target.getAttribute("data-type")) 
    plotChart(GRAPH_SELECTED)
})

plotChart = (type) => {

    let dim = getdim("#tickcasescontainer")

    $("#graph_selector").text($("#graphselectoroptions a[data-type=" + GRAPH_SELECTED + "]").text())

    switch (type) {
        case 1:
            linechart(AREA.tscases, {
                x: d => new Date(d.date),
                y: d => d.n,
                height: dim.width *0.5, 
                width: dim.width ,
                color: "#BD0026",
                div: "#heartwormcases",
                xLabel: "Year →",
                yLabel: "Total →",
            })
            break;

        case 2:
            linechart(AREA.tsadmissions, {
                x: d => new Date(d.date),
                y: d => d.n,
                height: dim.width *0.5, 
                width: dim.width ,
                color: "#BD0026",
                div: "#heartwormcases",
                xLabel: "Year →",
                yLabel: "Total →",
            })
            break;
    
        case 3:
            linechart(AREA.tsincidence, {
                x: d => new Date(d.date),
                y: d => d.incidence,
                height: dim.width *0.5, 
                width: dim.width ,
                color: "#BD0026",
                div: "#heartwormcases",
                xLabel: "Year →",
                yLabel: "Incidence Risk →",
            })
            break;
        default:
            linechart(AREA.tscases, {
                x: d => new Date(d.date),
                y: d => d.n,
                height: dim.width *0.5, 
                width: dim.width ,
                color: "#BD0026",
                div: "#heartwormcases",
                xLabel: "Year →",
                yLabel: "↑ Total",
            })
            break;
    }
}

function populatepage(region) {

    AREA = REGIONS_DATA.filter(pc => pc.postcode == region)[0]
    console.log(AREA)
    $("#regionselectheader").text(region)
    $("#noanimaldiagnosed").text(AREA.animalsdiagnosed)

    plotChart(GRAPH_SELECTED)
    Histogram(data = AREA.age, {
        div: "#agehist"
    })

    PieChart(data = AREA.prevention, {
        div: "#preventionpie",
        key: "prevention"
    })

    PieChart(data = AREA.treated, {
        div: "#treatmentpie",
        key: "treatment"
    })

    PieChart(data = AREA.sex, {
        div: "#sexpie",
        key: "PatientSex"
    })

    $("#testtakentable").empty()
    AREA.testtaken.forEach(row => {
        $("#testtakentable").append(`
            <tr>
                <td>${row.TestTakenBefore}</td>
                <td>${row.n}</td>
            </tr>
        `)
    })

    $("#sextable").empty()
    AREA.sex.forEach(row => {
        $("#sextable").append(`
            <tr>
                <td>${row.PatientSex}</td>
                <td>${row.n}</td>
            </tr>
        `)
    })

    $("#breedtable").empty()
    AREA.breed.forEach(row => {
        $("#breedtable").append(`
            <tr>
                <td>${row.PatientBreed}</td>
                <td>${row.n}</td>
            </tr>
        `)
    })

    $("#treatmenttable").empty()
    AREA.treated.forEach(row => {
        $("#treatmenttable").append(`
            <tr>
                <td>${row.treatment}</td>
                <td>${row.n}</td>
            </tr>
        `)
    })

    $("#symptomstable").empty()
    AREA.symptoms.forEach(row => {
        $("#symptomstable").append(`
            <tr>
                <td>${row.symptoms}</td>
                <td>${row.n}</td>
            </tr>
        `)
    })

    $("#preventiontable").empty()
    AREA.prevention.forEach(row => {
        $("#preventiontable").append(`
            <tr>
                <td>${row.prevention}</td>
                <td>${row.n}</td>
            </tr>
        `)
    })

}

plotMap = () => {
    fetch('./data/PostcodeSummaries.json')
        .then(response => response.json())
        .then(data => {
            postcode_totals = data
            postcodes = data.map(i => i.postcode)
            REGIONS_DATA = data
            data.forEach(v => $("#regionselectoptions").append("<a class='dropdown-item text-left h6' data-postcode='" + v.postcode + "' href='#''>" + v.postcode  +"</a>"))

            fetch('./data/postcode_map.geojson')
            .then(response => response.json())
            .then(data => {

                const parentNode = $("#map-container");
                parentNode.append('<div id="map"></div>');

                map = L.map('map', {
                    zoomControl: false
                })

                data = data.features.map(pc => {
                    if(postcodes.includes(pc.properties.POA_NAME16)) {
                        pc.properties.total = postcode_totals.filter(e => e.postcode == pc.properties.POA_NAME16)[0].animalsdiagnosed
                    } else {
                        pc.properties.total = NaN
                    }
                    return pc
                })
            

                let getColor = v => {
                    return  v > 500 ? '#800026' :
                            v > 200  ? '#BD0026' :
                            v > 100  ? '#E31A1C' :
                            v > 50  ? '#FC4E2A' :
                            v > 25   ? '#FD8D3C' :
                            v > 10   ? '#FEB24C' :
                            v > 5   ? '#FED976' :
                                        '#FFEDA0';

                }

                
                vector = L.geoJson(data, {
                    onEachFeature: (feature, layer) => {
                        let style;

                        
                        let zoomToFeature = (e) => {
                            // $("#map").css('width', '60%')
                            map.fitBounds(e.target.getBounds());
                            populatepage(e.target.feature.properties.POA_NAME16)
                            // setHeader(e.target.feature.properties.LGA_NAME20, e.target.feature.properties.LGA_CODE20, e.target.feature.properties.STE_NAME16)
                        }

                        let highlightFeature = (e) => {
                            let layer = e.target;

                            layer.setStyle({
                                weight: 2,
                                color: feature.properties.total ? getColor(feature.properties.total) : 'url(#repeat)',
                                dashArray: '',
                                color: "#00A7B970"
                            });
                            
                            layer.bindTooltip("<div><b>" + feature.properties.POA_NAME16 + "</b><div>Total:<b>" + feature.properties.total + "</b></div></div>").openTooltip()

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

                    var div = L.DomUtil.create('div', 'info legend'),
                        grades = [0, 5, 10, 25, 50, 100, 200, 500];
                
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
                    

                    return div;
                };

                legend.addTo(map);
            
                map.fitBounds(L.latLngBounds([
                    [-15, 138],
                    [-29, 154]
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

            // data.forEach(v => $("#regionselectoptions").append("<a class='dropdown-item text-left h6' data-postcode='" + v.postcode + "' href='#''>" + v.postcode  +"</a>"))
        
        populatepage("Overall")

    })
}