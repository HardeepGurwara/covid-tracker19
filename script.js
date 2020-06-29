var infoWindow;
var map;
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 42.47278, lng: -122.80167 },
    zoom: 3,
    styles: mapStyle,
  });

  infoWindow = new google.maps.InfoWindow();
}

window.onload = () => {
  getCountryData();
  getHistoricalData();
};

const getCountryData = () => {
  fetch("http://localhost:3000/countries")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      showDataOnMap(data);
      showDataInTable(data);
    });
};

const getHistoricalData = () => {
  fetch("https://corona.lmao.ninja/v2/historical/all?lastdays=10")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      let chartData = buildChartData(data);
      buildChart(chartData);
    });
};

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
        {
          label: "Total recovered",
          fill: false,
          borderColor: "rgb(98, 190, 129)",
          data: chartData.recovered,
        },
        {
          label: "Total deaths",
          fill: false,
          borderColor: "rgb(20, 87, 100)",
          data: chartData.deaths,
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
                return numeral(value).format("0,0");
              },
            },
          },
        ],
      },
    },
  });
};

const showDataOnMap = (data) => {
  data.map((country) => {
    let countryCenter = {
      lat: country.countryInfo.lat,
      lng: country.countryInfo.long,
    };

    var countryCircle = new google.maps.Circle({
      strokeColor: "#FF0000",
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.35,
      map: map,
      center: countryCenter,
      radius: country.cases,
    });

    var html = `
        <div class="info-container"> 
            <div class="country-flag" style="background-image: url(${country.countryInfo.flag});">
             </div> 
             <div class="info-name">${country.country} </div>
             <div class="info-total">Total: ${country.cases}</div>
             <div class="info-recovered">recovered: ${country.recovered}</div>
              <div class="info-deaths">Death: ${country.deaths} </div>
        </div>
        `;

    var infoWindow = new google.maps.InfoWindow({
      content: html,
      position: countryCircle.center,
    });

    google.maps.event.addListener(countryCircle, "mouseover", function () {
      infoWindow.open(map);
    });

    google.maps.event.addListener(countryCircle, "mouseout", function () {
      infoWindow.close();
    });
  });
};

const showDataInTable = (data) => {
  var html = "";
  data.map((country) => {
    html += `
        <tr>
        <td>${country.country}</td>
        <td>${country.cases}</td>
        <td>${country.recovered}</td>
        <td>${country.deaths}</td>
        </tr>
`;
  });
  document.getElementById("table-data").innerHTML = html;
};
