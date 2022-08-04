function populatepage(region) {
    
    switch(region) {
        case "Brisbane":
            selected = 0
            break;

        case "Gold Coast":
            selected = 1
            break;

        case "Logan":
            selected = 2
            break;

        case "Noosa":
            selected = 3
            break;

        case "Sunshine Coast":
            selected = 4
            break;

        case "Toowoomba":
            selected = 5
            break;

        default:
            selected = 1
            break;
    }

    d3.select("#percentageworse").select("svg").remove()
    d3.select("#forecastspread").select("svg").remove()
    d3.select("#forecastanomalies").select("svg").remove()
    d3.select("#thresholdprobability").select("svg").remove()


    // gauge("#gauge", 300, {value: Math.round(data[selected]["gauge"][0] * 100)})
    percentageworse({x:[1,2,3,4,5,6,7], y:[0,0.75,3,7,3,0.75,0]}, {
        x: "x",
        y: "y",
        width: getdim("#percentageworsecont").width,
        height: getdim("#percentageworsecont").height - 20,
        percentage: String(regiondata[selected]["gauge"][0] * 100) + "%",
        color: "#4e79a7"  
    })

    if(regiondata[selected]["gauge"][0] < 0.4) {
        $("#increasechance").text(String(Math.round(regiondata[selected]["gauge"][0] * 100)) + "%").css("color", "#4e79a7")
    } else if (regiondata[selected]["gauge"][0] > 0.4 && regiondata[selected]["gauge"][0] < 0.7) {
        $("#increasechance").text(String(Math.round(regiondata[selected]["gauge"][0] * 100)) + "%").css("color", "#f28e2c")
    } else {
        $("#increasechance").text(String(Math.round(regiondata[selected]["gauge"][0] * 100)) + "%").css("color", "#e15759")
    }
    

    thresholds({probs: regiondata[selected]["thresholds"][0], date: regiondata[selected]["months"]}, {
        x: "date",
        y: "probs",
        yFormat: "%",
        yLabel: "↑ Probability",
        width: getdim("#thresholdcont").width,
        height: getdim("#thresholdcont").height - 90,
        color: "#4e79a7"
    })
    
    forecast({forecast: regiondata[selected]["forecast"][0], date: regiondata[selected]["horizon"], fit: regiondata[selected]["forecastPoints"]}, {
        x : "date",
        y : "forecast",
        width: getdim("#forecastcont").width,
        height: getdim("#forecastcont").height*0.55,
        color: "#4e79a7",
        div: "#forecastspread",
        forecastdate: new Date("2022-01-01")
    })

    // forecasttrend({trend: regiondata[selected]["trends"], date: regiondata[selected]["horizon"]}, {
    //     x : "date",
    //     y : "trend",
    //     yLabel: "↑ Monthly Total",
    //     width: getdim("#forecasttrendcont").width,
    //     height: getdim("#forecasttrendcont").height - 0,
    //     color: "#4e79a7",
    //     div: "#forecasttrend",
    //     forecastdate: new Date("2022-01-01")
    // })

    forecastanomalies({forecast: regiondata[selected]["anomalies"], date: regiondata[selected]["horizon"]}, {
        x : "date",
        y : "forecast",
        width: getdim("#forecastcont").width,
        height: getdim("#forecastcont").height*0.25,
        color: "#4e79a7",
        div: "#forecastanomalies",
        forecastdate: new Date("2022-01-01")
    })

}

$("body").on("click", "div[aria-labelledby='region-selector'] a", e => {
    region = e.target.text
    $("#regionselectheader").text(region)
    populatepage(region)
})

$("input[id='inclforecast']").change(e => {
    let include = $(e.target).prop('checked')

    d3.select("#forecastspread").select("svg").remove()
    d3.select("#forecastanomalies").select("svg").remove()
    
    if(include) {
        forecast({forecast: regiondata[selected]["forecast"][0], date: regiondata[selected]["horizon"], fit: regiondata[selected]["forecastPoints"]}, {
            x : "date",
            y : "forecast",
            yLabel: "↑ Total",
            width: getdim("#forecastcont").width,
            height: getdim("#forecastcont").height*0.55,
            color: "#4e79a7",
            div: "#forecastspread",
            forecastdate: new Date("2022-01-01"),
            forecast: true
        })
    
        forecastanomalies({forecast: regiondata[selected]["anomalies"], date: regiondata[selected]["horizon"]}, {
            x : "date",
            y : "forecast",
            width: getdim("#forecastcont").width,
            height: getdim("#forecastcont").height*0.25 ,
            color: "#4e79a7",
            div: "#forecastanomalies",
            forecastdate: new Date("2022-01-01"),
            forecast: true
        })
    } else {
        forecast({forecast: regiondata[selected]["forecast"][0], date: regiondata[selected]["horizon"], fit: regiondata[selected]["forecastPoints"]}, {
            x : "date",
            y : "forecast",
            yLabel: "↑ Total",
            width: getdim("#forecastcont").width,
            height: getdim("#forecastcont").height*0.55,
            color: "#4e79a7",
            div: "#forecastspread",
            forecastdate: new Date("2022-01-01"),
            
        })
    
        forecastanomalies({forecast: regiondata[selected]["anomalies"], date: regiondata[selected]["horizon"]}, {
            x : "date",
            y : "forecast",
            width: getdim("#forecastcont").width,
            height: getdim("#forecastcont").height*0.25,
            color: "#4e79a7",
            div: "#forecastanomalies",
            forecastdate: new Date("2022-01-01"),
        })
    }
})

$("input[name='threshold']").change(e => {
    threshold = $(e.target).attr('id')
    let selection = 0

    switch(threshold) {
        case "thresholdone":
            selection = 0
            break;
        case "thresholdtwo":
            selection = 1
            break;
        case "thresholdthree":
            selection = 2
            break;
        case "thresholdfour":
            selection = 3
            break;
        default:
            selection = 0
    }

    d3.select("#thresholdprobability").select("svg").remove()
    // console.log(selection)
    thresholds({probs: regiondata[selected]["thresholds"][selection], date: regiondata[selected]["months"]}, {
        x: "date",
        y: "probs",
        yFormat: "%",
        yLabel: "↑ Frequency",
        width: getdim("#thresholdcont").width,
        height: getdim("#thresholdcont").height - 90,
        color: "#4e79a7"
    })
})