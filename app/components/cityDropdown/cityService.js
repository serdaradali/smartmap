/**
 * Created by Sedar on 06/03/2015.
 */

angular.module("geoAnalysis")
    .factory("cityService",['leafletData', 'choroService', function(leafletData,choroService) {

        var polygonReady = false, polygonPromise = {}, currLevel = 0;

        var selectedDivisionInd = 4;

        var cities = {
            "Paris": {
                name:"Paris",
                center: {
                    lat: 48.86685562,
                    lng: 2.307692766,
                    zoom: 13
                },
                max: 130,
                levels: ["Arrondiss.","Quartiers"]
            },
            "Berlin": {
                name:"Berlin",
                center: {
                    lat: 52.517989,
                    lng: 13.403164,
                    zoom: 12
                },
                max: 35,
                levels: ["Bezirke","Ortsteile"]},
            "Marseille": {
                name:"Marseille",
                center: {
                    lat: 43.277891,
                    lng: 5.370807,
                    zoom: 13
                },
                max: 16,
                levels: ["Arrondiss."]},
            "Lyon": {
                name:"Lyon",
                center: {
                    lat: 45.750170,
                    lng: 4.834091,
                    zoom: 13
                },
                max: 53,
                levels: ["Arrondiss.","Bureau"]},
            "Hamburg": {
                name:"Hamburg",
                center: {
                    lat: 53.540622,
                    lng: 9.995113,
                    zoom: 12
                },
                max: 29,
                levels: ["Bezirke",]},
            "London": {
                name:"London",
                center: {
                    lat: 51.504346,
                    lng:  -0.164905,
                    zoom: 12
                },
                max: 51,
                levels: ["Boroughs","Districts"]
            },
            "Barcelona": {
                name:"Barcelona",
                center: {
                    lat: 41.392730,
                    lng: 2.180182,
                    zoom: 13
                },
                max: 34,
                levels: ["Distritos","Barrios"]},
            "Madrid": {
                name:"Madrid",
                center: {
                    lat: 40.416658,
                    lng: -3.702711,
                    zoom: 13
                },
                max: 95,
                levels: ["Distritos","Barrios"]},
            "Bruxelles": {
                name:"Bruxelles",
                center: {
                    lat: 50.833063,
                    lng: 4.365122,
                    zoom: 13
                },
                max: 70,
                levels: ["Communes"]}
        };

        var selectedCenter = cities["Paris"].center;
        var getCenter = function() {
            return selectedCenter;
        }
        var setCenter = function(center) {
            selectedCenter = center;
        }

        var selectedCity = "Paris";

        var setSelectedCity = function(c) {
            selectedCity = c;
        }
        var getSelectedCity = function() {
            return selectedCity;
        }

        var getSelectedMax = function() {
            return cities[selectedCity].max;
        }

        var readCityPolygon = function(name,level) {
            currLevel = level;
            polygonReady = false;
            if(!cities[name].hasOwnProperty("polygon") || !cities[name]["polygon"].hasOwnProperty(currLevel.toString())) { // if city doesn't already have a polygon
                polygonPromise = d3.promise.json("assets/data/" + name + level + "Topo.json").then(function (json) {
                    var featureObj = topojson.feature(json, json["objects"][name]);
                    storePolygon(name, featureObj);
                    polygonReady = true;
                });
            }
            else {
                polygonReady = true;
            }
            return polygonPromise;
        }
        var storePolygon = function(city,features) {
            if(!cities[city].hasOwnProperty("polygon")) {// if this is the first time we load a polygon for this city
                cities[city]["polygon"] = {};
            }
            cities[city]["polygon"][currLevel] = features;
        }

        var getSelectedCityPolygon = function() {
            return cities[selectedCity]["polygon"][currLevel]
        }

        var getPolygonStatus = function() {
            return polygonReady;
        }

        var setPolygonStatus = function(bool) {
            polygonReady = bool;
        }

        var getCurrentDivisionBounds = function() {
            return d3.geo.bounds(cities[selectedCity]["polygon"][currLevel].features[selectedDivisionInd]);
        }

        var getCurrentDivision = function() {
            return cities[selectedCity]["polygon"][currLevel].features[selectedDivisionInd].properties.name
        }
        var setCurrentDivision = function(d) {
            selectedDivisionInd = d;
        }

        var getPolygonStatus2 = function() {
            return polygonPromise;
        }

        var getCurrentCityLevels = function() {
            return cities[selectedCity]["levels"];
        }


        return {
            cities: cities,
            getSelectedCityPolygon: getSelectedCityPolygon,
            getCenter: getCenter,
            setCenter: setCenter,
            getSelectedMax: getSelectedMax,
            setSelectedCity: setSelectedCity,
            getSelectedCity: getSelectedCity,
            readCityPolygon: readCityPolygon,
            getPolygonStatus: getPolygonStatus,
            getPolygonStatus2: getPolygonStatus2,
            setPolygonStatus: setPolygonStatus,
            getCurrentDivisionBounds: getCurrentDivisionBounds,
            getCurrentDivision: getCurrentDivision,
            setCurrentDivision: setCurrentDivision,
            getCurrentCityLevels: getCurrentCityLevels
        }

    }]);
