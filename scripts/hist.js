
// function map(totals) {

//     let lgas = totals.map(l => l.LGACode)
    
//     fetch('./data/aus_lga_map.geojson')
//     .then(response => response.json())
//     .then(data => {
//         let map = L.map('map', {zoomControl: false}).setView([151.2093,-33.8688],zoom = 25),
//         vector = L.geoJson(data, {
//             onEachFeature: (feature, layer) => {
//                 layer.on("click", (e, d) => {
//                     console.log(e.target.feature.properties)
//                 })
//                 layer.on("mouseover", (e, d) => {
//                     layer.setStyle({
//                         fillColor: "#EC5858"
//                     })
//                 })
//                 layer.on("mouseout", (e, d) => {
//                     layer.setStyle({
//                         fillColor: "#DCBCBC"
//                     })
//                 })
//             },
//             style: {
//                 color: "#EC5858",
//                 weight: 1,
//                 fillColor: "#DCBCBC",
//                 fillOpacity: 1
//             }
//         }).addTo(map); 
//         map.fitBounds(vector.getBounds());
//         // vector.bindPopup(function (layer) {
//         //     return layer.feature.properties.description;
//         // }) 
//     })
//     .catch(error => console.log(error));
// }

function affectedAreas() {
    fetch("./data/region_totals.json")
            .then(response => response.json())
            .then(data => {
                const areas = data.sort((a, b) => b.total - a.total).slice(0,5)
                areas.forEach((record, i) => {
                    let width = i == 0 ? 100 : (areas[i].total / areas[0].total * 100)
                    console.log(width, i)
                    // $("#topAffected").append("<div>")
                    $("#topAffected").append("<div><span class'fw-bold text-muted'>"+ record.Region + "</span><div class='meter d-flex text-white justify-content-end px-1 rounded' style=width:" + width + "%;" + "><b>" + record.total + "</b></div></div>")
                    // $("#topAffected").append("</div>")
                });
            })
}

$("input[name='histanom']").change(e => {
    anomtype = $(e.target).attr('id')
    anom("anom", anomtype)
})

function anom(type, strat) {

    let link = ""
    let comp = ""

    switch(strat){
        case "histanomoverall":
            link = "./data/change_overall.json"
            break;
        case "histanomstate":
            link = "./data/change_state.json"
            comp = "state"
            break;
        case "histanomregion":
            link = "./data/change_region.json"
            comp = "Region"
            break;
        default:
            link = "./data/overall_stl.json"
    }

    fetch(link)
        .then(response => response.json())
        .then(data => {
            let dim = getdim("#tickanomcontainer")
            anomalieschart(data, {
                x: d => new Date(d.date),
                y: d => d[type],
                z: d => d[comp],
                width: dim.width,
                height: dim.height - 110,
                color: "#4e79a7",
                div: "#" + type
            })

        })

}

//////// Event Handlers for Admissions and Tick cases
$("input[name='tickcasecomp']").change(e => {
    tickcasecomp = $(e.target).attr('id')
    tickcases(tickcasecomp, tickcasetype)
})

$("input[name='tickcasetype']").change(e => {
    tickcasetype = $(e.target).attr('id')
    tickcases(tickcasecomp, tickcasetype)
})

$("input[name='tickadmcomp']").change(e => {
    tickadmcomp = $(e.target).attr('id')
    tickadmissions(tickadmcomp, tickadmtype)
})

$("input[name='tickadmtype']").change(e => {
    tickadmtype = $(e.target).attr('id')
    tickadmissions(tickadmcomp, tickadmtype)
})

function tickadmissions(tickadmcomp, tickadmtype) {
    let link = ""
    let comb = tickadmcomp + "~" + tickadmtype
    console.log(comb)
    switch(comb) {
        case "tickadmcompoverall~tickadmtypeyear":
            link = "./data/overall_yearly_admissions.json"
            break;
        case "tickadmcompstate~tickadmtypeyear":
            link = "./data/state_yearly_admissions.json"
            break;
        case "tickadmcompregion~tickadmtypeyear":
            link = "./data/regions_yearly_admissions.json"
            break;
        case "tickadmcompoverall~tickadmtypemonth":
            link = "./data/overall_monthly_admissions.json"
            break;
        case "tickadmcompstate~tickadmtypemonth":
            link = "./data/state_monthly_admissions.json"
            break;
        case "tickadmcompregion~tickadmtypemonth":
            link = "./data/regions_monthly_admissions.json"
            break;
        case "tickadmcompoverall~tickadmtypecumulative":
            link = "./data/overall_cumulative_admissions.json"
            break;
        case "tickadmcompstate~tickadmtypecumulative":
            link = "./data/state_cumulative_admissions.json"
            break;
        case "tickadmcompregion~tickadmtypecumulative":
            link = "./data/regions_cumulative_admissions.json"
            break;
        default:
            link = "./data/overall_monthly_admissions.json"
    }
    fetch(link)
        .then(response => response.json())
        .then(data => {
            let dim = getdim("#tickadmscontainer")
            linechart(data, {
                x: d => tickadmtype == "tickadmtypeyear" ? d.date : new Date(d.date),
                y: d => d.n,
                z: d => d.strat,
                height: dim.height - 100,
                width: dim.width,
                color: "#4e79a7",
                div: "#tickadmissions",
                xLabel: "Date →",
                yLabel: "↑ Total"
            })

        })

}

function tickcases(tickcasecomp, tickcasetype) {
    let link = ""
    let comb = tickcasecomp + "~" + tickcasetype
    
    switch(comb) {
        case "tickcasecompoverall~tickcasetypeyear":
            link = "./data/overall_yearly_cases.json"
            break;
        case "tickcasecompstate~tickcasetypeyear":
            link = "./data/state_yearly_cases.json"
            break;
        case "tickcasecompregion~tickcasetypeyear":
            link = "./data/regions_yearly_cases.json"
            break;
        case "tickcasecompoverall~tickcasetypemonth":
            link = "./data/overall_monthly_cases.json"
            break;
        case "tickcasecompstate~tickcasetypemonth":
            link = "./data/state_monthly_cases.json"
            break;
        case "tickcasecompregion~tickcasetypemonth":
            link = "./data/regions_monthly_cases.json"
            break;
        case "tickcasecompoverall~tickcasetypecumulative":
            link = "./data/overall_cumulative_cases.json"
            break;
        case "tickcasecompstate~tickcasetypecumulative":
            link = "./data/state_cumulative_cases.json"
            break;
        case "tickcasecompregion~tickcasetypecumulative":
            link = "./data/regions_cumulative_cases.json"
            break;
        default:
            link = "./data/overall_monthly_cases.json"
    }
    
    fetch(link)
        .then(response => response.json())
        .then(data => {
            let dim = getdim("#tickcasescontainer")
            linechart(data, {
                x: d => new Date(d.date),
                y: d => d.n,
                z: d => d.strat,
                height: dim.height - 100,
                width: dim.width,
                color: "#4e79a7",
                div: "#tickcases",
                xLabel: "Date →",
                yLabel: "↑ Total"
            })

        })

}


// FOR SEASONALITY AND TREND

// $("input[name='radioseasonality']").change(e => {
//     seasonalitytype = $(e.target).attr('id')
//     stl("seasonal", seasonalitytype)
// })

// $("input[name='radiotrend']").change(e => {
//     trendtype = $(e.target).attr('id')
//     stl("trend", trendtype)
// })

// function stl(type, strat) {

//     let link = ""

//     switch(strat){
//         case "trendoverall":
//             link = "./data/overall_stl.json"
//             break;
//         case "trendstate":
//             link = "./data/state_stl.json"
//             break;
//         case "trendregion":
//             link = "./data/regions_stl.json"
//             break;
//         case "seasonalityoverall":
//             link = "./data/overall_stl.json"
//             break;
//         case "seasonalitystate":
//             link = "./data/state_stl.json"
//             break;
//         case "seasonalityregion":
//             link = "./data/regions_stl.json"
//             break;
//         default:
//             link = "./data/overall_stl.json"
//     }

//     fetch(link)
//         .then(response => response.json())
//         .then(data => {
//             stllinechart(data, {
//                 x: d => new Date(d.date),
//                 y: d => d[type],
//                 z: d => d.strat,
//                 width: 450,
//                 height: 200,
//                 color: "#4e79a7",
//                 div: "#" + type
//             })

//         })

// }