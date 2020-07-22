var infoWindow;
var map;
let coronaGlobalData;
let mapCircles = [];
let casesTypeColors = {
  cases: "#1d2c4d",
  active: "#9d80fe",
  recovered: "#7dd71d",
  deaths: "#fb4443",
};
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
  getWorldCoronaData();
};

const changeDataSelections = (casesTypes) => {
  clearTheMap();
  showDataOnMap(coronaGlobalData, casesTypes);
};

const clearTheMap = () => {
  for (let circle of mapCircles) {
    circle.setMap(null);
  }
};

const getCountryData = () => {
  fetch("http://localhost:3000/countries")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      coronaGlobalData = data;
      showDataOnMap(data);
      showDataInTable(data);
    });
};

const getWorldCoronaData = () => {
  fetch("https://disease.sh/v2/all")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      // buildPieChart(data);
      setStatsData(data);
    });
};

const setStatsData = (data) => {
  let addedCases = numeral(data.todayCases).format("+0,0");
  let addedRecovered = numeral(data.todayRecovered).format("+0,0");
  let addedDeaths = numeral(data.todayDeaths).format("+0,0");
  let totalCases = numeral(data.cases).format("0.0a");
  let totalRecovered = numeral(data.recovered).format("0.0a");
  let totalDeaths = numeral(data.deaths).format("0.0a");
  document.querySelector(".total-number").innerHTML = addedCases;
  document.querySelector(".recovered-number").innerHTML = addedRecovered;
  document.querySelector(".deaths-number").innerHTML = addedDeaths;
  document.querySelector(".cases-total").innerHTML = `${totalCases} Total`;
  document.querySelector(
    ".recovered-total"
  ).innerHTML = `${totalRecovered} Recovered`;
  document.querySelector("deaths-total").innerHTML = `${totalDeaths} Deaths`;
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

const showDataOnMap = (data, casesTypes = "cases") => {
  data.map((country) => {
    let countryCenter = {
      lat: country.countryInfo.lat,
      lng: country.countryInfo.long,
    };

    var countryCircle = new google.maps.Circle({
      strokeColor: casesTypeColors[casesTypes],
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: casesTypeColors[casesTypes],
      fillOpacity: 0.35,
      map: map,
      center: countryCenter,
      radius: country[casesTypes],
    });

    mapCircles.push(countryCircle);

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
        <td>${numeral(country.cases).format("0,0")}</td>
        </tr>
`;
  });
  document.getElementById("table-data").innerHTML = html;
};
