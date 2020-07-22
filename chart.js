const buildChartData = (data) => {
  // `data: [{
  //     x: new Date(),
  //     y: 1
  // }, {
  //     t: new Date(),
  //     y: 10
  // }]`
  let chartDataCases = [];
  let chartDataRecovered = [];
  let chartDataDeaths = [];
  for (let date in data.cases) {
    let newDataCasesPoint = {
      x: date,
      y: data.cases[date],
    };
    let newDataRecoveredPoint = {
      x: date,
      y: data.recovered[date],
    };
    let newDataDeathsPoint = {
      x: date,
      y: data.deaths[date],
    };
    chartDataCases.push(newDataCasesPoint);
    chartDataRecovered.push(newDataRecoveredPoint);
    chartDataDeaths.push(newDataDeathsPoint);
  }
  return {
    cases: chartDataCases,
    recovered: chartDataRecovered,
    deaths: chartDataDeaths,
  };
};

const buildPieChart = (data) => {
  var ctx = document.getElementById("myPieChart").getContext("2d");
  var myPieChart = new Chart(ctx, {
    type: "pie",
    data: {
      datasets: [
        {
          data: [data.active, data.recovered, data.deaths],
          backgroundColor: ["#9d80fe", "#7dd71d", "#fb4443"],
        },
      ],

      // These labels appear in the legend and in the tooltips when hovering different arcs
      labels: ["Active", "Recovered", "Deaths"],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
    },
  });
};

const buildChart = (chartData) => {
  var ctx = document.getElementById("myChart").getContext("2d");
  var timeFormat = "MM/DD/    YY";
  var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: "line",

    // The data for our dataset
    data: {
      datasets: [
        {
          label: "Total Cases",
          fill: false,
          borderColor: "rgb(212, 106, 106)",
          data: chartData.cases,
        },
      ],
    },

    // Configuration options go here
    options: {
      maintainAspectRatio: false,
      tooltips: {
        node: "index",
        intersect: false,
      },
      scales: {
        xAxes: [
          {
            type: "time",
            time: {
              format: timeFormat,
              tooltipFormat: "ll",
            },
            scaleLabel: {
              display: true,
              labelString: "Date",
            },
          },
        ],
        yAxes: [
          {
            ticks: {
              // Include a dollar sign in the ticks
              callback: function (value, index, values) {
                return numeral(value).format("0a");
              },
            },
            gridLines: {
              display: false,
            },
          },
        ],
      },
    },
  });
};
