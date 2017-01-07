//accesses and parses the JSON file, stores it in variable myArr, calls function getInfo(myArr). Needless to say this has been adapted from code that was given to us in the practicals. 
function jsonParser() {
    var xmlhttp = new XMLHttpRequest();
    var url = "Daily.json";
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var myArr = JSON.parse(xmlhttp.responseText);
            getInfo(myArr);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}


//Takes data from the parsed JSON file (myArr) and displays it in weatherInfo
function getInfo(arr) {
    var formInput = document.getElementById("daySelect").value;
    var out = "";
    var i;
    for (i = 0; i < formInput; i++) {
        var iconCode = arr.list[i].weather[0].icon; //got this idea from https://www.reddit.com/r/FreeCodeCamp/comments/4con5s/how_do_i_use_the_icon_given_in_the_open_weather/d1k8dv8/
        var iconUrl = "http://openweathermap.org/img/w/" + iconCode + ".png";
        var icon = "<img src='" + iconUrl + "'>";
        var dayTemp = "<div class='dayTempDiv'<p>" + Math.round(arr.list[i].temp.day) + "&#8451;</p></div>";
        //this one's a little confusing. I have the min/max temp in the same <p>, each with it's own span, inside another div.
        var minMaxTemp = "<div class='minMaxDiv'<p><span class='minSpan'>" + arr.list[i].temp.min + "&#8451; </span> / <span class='maxSpan'>" + arr.list[i].temp.max + "&#8451;</span></p></div>";
        var description = "<div class='descriptionDiv'><p>" + arr.list[i].weather[0].description + "</p></div>";
        var pressure = "<div class='pressureDiv'><p>Pressure: " + arr.list[i].pressure + "hPa</p></div>";
        var humidity = "<div class='humidityDiv'><p>Humidity: " + arr.list[i].humidity + "%</p></div>";
        var windspeed = "<div class='windspeedDiv'><p>Wind Speed: " + arr.list[i].humidity + "Kts</p></div>";
        var showMore = "<button onclick='detailedJsonParser(" + i + "); changeColor(" + i + "); showInfo(\"detailedInfo\");'>Show More</button>";

        out += "<div class='dayDiv'><h3>Day " + (i + 1) + "</h3>" + icon + dayTemp + description + minMaxTemp + pressure + humidity + windspeed + showMore + "</div>";
    }
    document.getElementById("weatherInfo").innerHTML = out;
    checkShow('pressureBox', 'pressureDiv');
    checkShow('humidityBox', 'humidityDiv');
    checkShow('windspeedBox', 'windspeedDiv');
}


//x corresponds with the day number of the button that's pressed. Since we're calling getDetailedInfo from this function, I'm taking it as an argument here and passing it through to the other function. 
function detailedJsonParser(x) {
    var xmlhttp = new XMLHttpRequest();
    var url = "Detailed.json";
    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var myArr = JSON.parse(xmlhttp.responseText);
            getDetailedInfo(myArr, x);
        }
    };
    xmlhttp.open("GET", url, true);
    xmlhttp.send();
}


function getDetailedInfo(arr, x) {
    var out = "";
    var timeHead = "<th>Time</th>";
    var iconHead = "<th>Icon</th>";
    var desHead = "<th>Description</th>";
    var tempHead = "<th>Temperature</th>";
    var presHead = "<th>Pressure</th>";
    var windHead = "<th>Windspeed</th>";
    var humHead = "<th>Humidity</th>";
    var rainHead = "<th>Rain</th>";
    out = "<table id='detailedTable'><tr>" + timeHead + iconHead + desHead + tempHead + presHead + windHead + humHead + rainHead + "</tr>";
    document.getElementById("detailedExtra").innerHTML = out; 
    
    var i;
    var base;
    var bound;
    if (x == 0) {
        base = 0;
        bound = 5;
    } else if (x == 1) {
        base = 5;
        bound = 13;
    } else if (x == 2) {
        base = 13;
        bound = 21;
    } else if (x == 3) {
        base = 21;
        bound = 29;
    } else if (x == 4) {
        base = 29;
        bound = 37;
    }
    for (i = base; i < bound; i++) {
        var iconCode = arr.list[i].weather[0].icon;
        var iconUrl = "http://openweathermap.org/img/w/" + iconCode + ".png";
        var icon = "<img src='" + iconUrl + "'>";
        var timeDate = arr.list[i].dt_txt.split(" ");
        var description = arr.list[i].weather[0].description;
        var temp = arr.list[i].main.temp + "&#8451;";
        var rain = arr.list[i].rain["3h"] + "mm<sup>3</sup>";
        var pressure = arr.list[i].main.pressure + "hPa";
        var windspeed = arr.list[i].wind.speed + "Kts";
        var humidity = arr.list[i].main.humidity + "%";
        var table = document.getElementById("detailedTable");
        var row = table.insertRow();
        var cell1 = row.insertCell(0);
        var cell2 = row.insertCell(1);
        var cell3 = row.insertCell(2);
        var cell4 = row.insertCell(3);
        var cell5 = row.insertCell(4);
        var cell6 = row.insertCell(5);
        var cell7 = row.insertCell(6);
        var cell8 = row.insertCell(7);
        cell1.innerHTML = timeDate[1];
        cell2.innerHTML = icon;
        cell3.innerHTML = description;
        cell4.innerHTML = temp;
        cell5.innerHTML = pressure;
        cell6.innerHTML = windspeed;
        cell7.innerHTML = humidity;
        cell8.innerHTML = rain;
    }

    //puts data needed for chart into an array named chartData
    var chartData = [
        ["Time", "Temp"]
    ];
    var timeDate;
    for (i = base; i < bound; i++) {
        timeDate = arr.list[i].dt_txt.split(" ");
        chartData.push([
            timeDate[1],
            arr.list[i].main.temp
        ]);
    }
    makeChart(timeDate[0], chartData);
}

//function to make the chart, x is the date to be displayed above the chart, y is the data to be displayed on the chart. Used the google charts API, and adapted this code from their line chart tutorial https://developers.google.com/chart/interactive/docs/gallery/linechart
function makeChart(x, y) {
    google.charts.load('current', {
        'packages': ['corechart']
    });
    google.charts.setOnLoadCallback(drawVisualization);

    function drawVisualization() {
        var data = google.visualization.arrayToDataTable(y);
        var options = {
            title: "Temperature on " + x,
            vAxis: {
                title: 'Degrees Celsius'
            },
            hAxis: {
                title: 'Time'
            },
            seriesType: 'line',
            backgroundColor: "darkgrey",
            textColor: "white",
        };
        var chart = new google.visualization.ComboChart(document.getElementById('chart_div'));
        chart.draw(data, options);
    }
}

//Shows the <div> specified by idName
function showInfo(idName) {
    document.getElementById(idName).style.display = "block";
}

//Hides the <div> specified by idName
function hideInfo(idName) {
    document.getElementById(idName).style.display = "none";
}


//shows/hides div (divClass) based on whether box (boxClass) is checked. I took inspiration from something I found on stackoverflow, but I can't find the source now for the life of me... In any case, the only thing that is not my own is the "? 'block' : 'none';" idea. 
function checkShow(boxClass, divClass) {
    var varBox = document.getElementById(boxClass);
    var varDiv = document.getElementsByClassName(divClass);
    var formInput = document.getElementById("daySelect").value;
    var i;
    for (i = 0; i < formInput; i++) {
        varDiv[i].style.display = varBox.checked ? "block" : "none";
    }
}

//map function - used the google maps API 
function myMap() {
    var mapCanvas = document.getElementById("map");
    var mapOptions = {
        center: new google.maps.LatLng(53.3498, -6.2603),
        zoom: 10
    };
    var map = new google.maps.Map(mapCanvas, mapOptions);
}

//change color function
function changeColor(k) {
    var x = document.getElementsByClassName("dayDiv");
    var i;
    for (i = 0; i < x.length; i++) {
        x[i].style.backgroundColor = "darkgrey";
    }
    x[k].style.backgroundColor = "tomato";
}
