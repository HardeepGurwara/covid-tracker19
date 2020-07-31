var infoWindow;
var map;
let coronaGlobalData;
let mapCircles = [];
const worldwideSelection = {
  name: "WorldWide",
  value: "WWW",
  selected: true,
};
let casesTypeColors = {
  cases: "#1d2c4d",
  active: "#9d80fe",
  recovered: "#7dd71d",
  deaths: "#fb4443",
};
const mapCenter = {
  lat: 34.80746,
  lng: -40.4796,
};

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: mapCenter,
    zoom: 2,
    styles: mapStyle,
  });

  infoWindow = new google.maps.InfoWindow();
}

window.onload = () => {
  getCountriesData();
  getHistoricalData();
  getWorldCoronaData();
};

const initDropdown = (searchList) => {
  $(".ui.dropdown").dropdown({
    values: searchList,
    onChange: function (value, text) {
      // custom action
      if (value !== worldwideSelection.value) {
        getCountryData(value);
      } else {
        getWorldCoronaData();
      }
    },
  });
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

const setMapCentre = (lat, long, zoom) => {
  map.setZoom(zoom);
  map.panTo({
    lat: lat,
    lng: long,
  });
};

const setSearchList = (data) => {
  let searchList = [];
  searchList.push(worldwideSelection);
  data.forEach((countryData) => {
    searchList.push({
      name: countryData.country,
      value: countryData.countryInfo.iso3,
    });
  });

  initDropdown(searchList);
};

const getCountriesData = () => {
  fetch("http://localhost:3000/countries")
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      coronaGlobalData = data;
      setSearchList(data);
      showDataOnMap(data);
      showDataInTable(data);
    });
};

const getCountryData = (countryIso) => {
  const url = "https://disease.sh/v3/covid-19/countries/" + countryIso;

  fetch(url)
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      setMapCentre(data.countryInfo.lat, data.countryInfo.long, 4);
      setStatsData(data);
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
      setMapCentre(mapCenter.lat, mapCenter.lng, 2);
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
  document.querySelector(".deaths-total").innerHTML = `${totalDeaths} Deaths`;
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
