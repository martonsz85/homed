/*!
* Start Bootstrap - Bare v5.0.7 (https://startbootstrap.com/template/bare)
* Copyright 2013-2021 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-bare/blob/master/LICENSE)
*/

var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'))
var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
  return new bootstrap.Popover(popoverTriggerEl)
})

var [servicesTotal, servicesHealthy, servicesUnhealthy] = [0,0,0];
var radarTimer = 5 * 60 * 1000; // 5 Minutes
var serviceTimer = 5 * 60 * 1000; // 5 Minutes

function getPreferences() {
  try {
    return JSON.parse(localStorage.getItem('homed-preferences')) || {};
  } catch (e) {
    return {};
  }
}

function savePreferences(prefs) {
  localStorage.setItem('homed-preferences', JSON.stringify(prefs));
}

function applyDarkMode(enabled) {
  document.body.classList.toggle('dark-mode', enabled);
  document.body.classList.toggle('light-mode', !enabled);
  document.getElementById('control-darkmode').checked = enabled;
}

function darkmodeTender() {
  document.getElementById('control-darkmode').addEventListener('click', function() {
    var prefs = getPreferences();
    prefs.darkMode = this.checked;
    savePreferences(prefs);
    applyDarkMode(this.checked);
    console.log(hdate(), 'Dark mode toggled', this.checked ? 'on' : 'off');
  });
}

function refresh_weather() {
  var currentRadar = document.getElementById('currentRadar');

  console.log(hdate(), 'Refreshing radar loop')
  setRadarTimer();
  fetch('/homedweather', { method: 'GET' })
    .then(Result => Result.text())
    .then(weather => {
      console.log(hdate(), 'Updating weather HTML');
      document.getElementById('weather-section').innerHTML = weather;
    })
}

function refresh_status_checks() {
  console.log(hdate(), "Refreshing status checks");
  servicesTotal = 0;
  servicesHealthy = 0;
  servicesUnhealthy = 0;
  status_checks = document.querySelectorAll('[data-statuscheck="True"]').forEach(status_check => {
    status_check.classList.add("service-health")
    if ('statusservice' in status_check.dataset && status_check.dataset.statuscheck === 'True') {
      var url = '/serviceStatus/' + status_check.dataset.statusservice;

      console.log(hdate(), 'Status check for:', status_check.dataset.statusservice, url);

      fetch(url, { method: 'GET' })
        .then(Result => Result.json())
        .then(status_check => {
          var statusEl = document.getElementById('footer-text');
          console.log(hdate(), 'Status check result:', status_check);
          el = document.querySelectorAll('[data-statusservice="' + status_check.service + '"]').forEach(service_el => {
            servicesTotal++;
            if (status_check.status_code == 200) {
              servicesHealthy++;
              service_el.classList.add("service-healthy")
            } else {
              servicesUnhealthy++;
              service_el.classList.add("service-unhealthy")
            }
          })

          statusEl.innerHTML = servicesTotal + ' services (' + servicesHealthy + ' Up, ' + servicesUnhealthy + ' down) - Updated: ' + hdate();
        })
    }
  })

  setServiceStatusTimer();
}

function hdate() {
  return new Date().toLocaleDateString(navigator.languages[0], {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    hour12: false,
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  })
}

function setRadarTimer() {
  setTimeout(function() {
    refresh_weather();
  }, radarTimer); // Refresh radar every 5 minutes
  console.log(hdate(), 'Created radar refresh trigger');
}

function setServiceStatusTimer() {
  setTimeout(function() {
    refresh_status_checks();
  }, serviceTimer); // Refresh status checks every 5 minutes
  console.log(hdate(), 'Created status check refresh trigger');
}

function ready(fn) {
  if (document.readyState !== 'loading'){
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(function () {
  darkmodeTender();

  var prefs = getPreferences();
  if (prefs.darkMode !== undefined) {
    applyDarkMode(prefs.darkMode);
  } else {
    // No stored preference — sync checkbox to config-driven body class
    document.getElementById('control-darkmode').checked = document.body.classList.contains('dark-mode');
  }

  document.addEventListener('keydown', function (event) {
    if (document.activeElement !== document.getElementById("homed-search-field")) {
      if (event.key === '?') {
        console.log('Shortcut help toggle');
        document.getElementById("shortcuts-toggle").click();
      } else if (event.key === '/') {
        var modal = document.getElementById("search-modal");
        console.log('Search form toggle');
        document.getElementById("homed-search-field").value = "";
        document.getElementById("search-toggle").click();
        setTimeout(function() { document.getElementById("homed-search-field").focus(); }, 500);
      }
    }
  });

  var search_form = document.getElementById("homed-search-form");
  search_form.addEventListener("submit", function(e) {
    document.getElementById("search-toggle").click();
  });

  var weatherIsPresent = document.getElementsByClassName('weather-tabs');
  if (weatherIsPresent.length > 0) {
    setRadarTimer();
  }
  refresh_status_checks();
});
