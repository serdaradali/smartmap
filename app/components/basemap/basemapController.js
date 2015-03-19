/**
 * Created by Sedar on 06/03/2015.
 */

angular.module("geoAnalysis")
.controller("mapController",['$rootScope','$scope', 'dataService', 'leafletData', 'heatMapService','categoryService',
        'cityService', 'intersectService', '$q',
        function($rootScope, $scope, dataService, leafletData, heatMapService, categoryService,
                 cityService, intersectService, $q){

            var restaurant_icons = {
                defaultIcon: {
                    iconUrl: 'assets/img/restaurant.png',
                    iconSize: [16, 19], // size of the icon
                    shadowSize: [0,0]
                },
                chinese: {
                    iconUrl: 'assets/img/restaurants/restaurant_chinese.png',
                    iconSize:     [16, 18] // size of the icon
                    //iconAnchor:   [11, 47], // point of the icon which will correspond to marker's location
                    //popupAnchor:  [-2, -38] // point from which the popup should open relative to the iconAnchor
                }
            }

            angular.extend($scope,{
                mapObj: {},
                center: {
                    lat: 48.86685562,
                    lng: 2.307692766,
                    zoom: 13
                },
                legend: {
                    position: 'bottomright',
                    colors: [],
                    labels: []
                },
                markers: new Array(),
                levels: cityService.getCurrentCityLevels(),
                levelInd: 0
            });


            angular.extend($scope, {
                layers: {
                    baselayers: {
                        mapBox: {
                            name: "Smooth background",
                            type: "xyz",
                            url: "https://dnv9my2eseobd.cloudfront.net/v3/cartodb.map-4xtxp73f/{z}/{x}/{y}.png",
                            layerOptions: {
                                attribution: 'Developed by <a href="http://infovis.guru">Serdar Adali</a>, data provided by <a href="http://resto-in.fr">resto-in</a>.'
                            },
                            layerParams: {}
                        },
                        customMapBox: {
                            name: "Detailed",
                            url: "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                            type: "xyz",
                            layerOptions: {
                                attribution: 'Developed by <a href="http://infovis.guru">Serdar Adali</a>, data provided by <a href="http://resto-in.fr">resto-in</a>.'
                            }
                        }
                    }
                },
                choropleth: {
                    data: [],
                    jsonFeature: {},
                    config: {},
                    ratings: [],
                    layerStatus: "block",
                    colors: ["rgba(255,255,178,0.8)", "rgba(254,217,118,0.8)", "rgba(254,178,76,0.8)",
                        "rgba(253,141,60,0.8)", "rgba(240,59,32,0.8)", "rgba(189,0,38,0.8)"],
                    values: [0.1, 0.2, 0.4, 0.6, 0.8, 1.01]
                },
                updateMarkers: function(data) {
                    $scope.markers = [];
                    data.forEach(function(d){
                        $scope.markers.push({
                            lat: d.lat,
                            lng: d.lng,
                            focus: false,
                            draggable: false,
                            message: d.Name,
                            icon: restaurant_icons.defaultIcon//restaurant_icons.hasOwnProperty(d.Category) ? restaurant_icons[d.Category] : restaurant_icons.defaultIcon
                        });
                    });
                },
                updateLegend: function() {
                    var valuesD = $scope.choropleth.values.slice(0);
                    valuesD.pop();
                    valuesD.unshift(0);
                    var tempC = [],tempL = [];
                    var max = Math.max.apply(null, intersectService.getIntensityCount());
                    for(var i=0; i<$scope.choropleth.colors.length; i++) {
                        tempC.push($scope.choropleth.colors[i]);
                        if((i+1) == $scope.choropleth.colors.length) {
                            tempL.push(Math.round((valuesD[i])*max)+"+")
                        }
                        else {
                            tempL.push(Math.round((valuesD[i])*max) + "-" + Math.round((valuesD[i+1])*max))
                        }
                    }
                    $scope.legend = {
                        position: 'bottomright',
                        colors: tempC,
                        labels: tempL
                    }
                },
                updateChoroAndLegend: function(city,isNewPolygon) {
                    if(isNewPolygon) {
                        cityService.readCityPolygon(city, $scope.levelInd).then(function (data) {
                            intersectService.init(cityService.getSelectedCityPolygon(), dataService.getFilteredData());
                            $scope.choropleth.jsonFeature = cityService.getSelectedCityPolygon();
                            $rootScope.$broadcast('polygonChanged');
                            $scope.choropleth.data = intersectService.getCityIntensityCenter();
                            $rootScope.$broadcast('dataChanged');
                            $scope.choropleth.ratings = intersectService.getRegionRatings();
                            $scope.updateLegend();
                        })
                    }
                    else {
                        intersectService.init(cityService.getSelectedCityPolygon(), dataService.getFilteredData());
                        $scope.choropleth.data = intersectService.getCityIntensityCenter();
                        $rootScope.$broadcast('dataChanged');
                        $scope.choropleth.ratings = intersectService.getRegionRatings();
                        $scope.updateLegend();
                    }
                },
                init: function() {
                    dataService.filterByCity("Paris");
                    /*$scope.choropleth.colorScale = d3.scale.threshold()
                        .domain($scope.choropleth.values)
                        .range($scope.choropleth.colors);*/

                    $scope.updateChoroAndLegend("Paris",true);
                    $scope.updateLegend();
                    $scope.updateMarkers(dataService.getFilteredData());
                    //heatMapService.setData(dataService.getFilteredData(), cityService.getSelectedMax());
                },
                setLevel: function(l_ind){
                    $scope.levelInd = l_ind;
                    if(l_ind == 1) {
                        $scope.updateChoroAndLegend(cityService.getSelectedCity(),true);
                    }
                    else {
                        $scope.updateChoroAndLegend(cityService.getSelectedCity(),true);
                    }
                }
            });

            // when map is ready

            leafletData.getMap().then(function(map) {
                $scope.mapObj = map;

                L.control.scale({position:'bottomleft'}).addTo(map);

                intersectService.setMapObj(map);
                // when data is ready
                dataService.readData().then(function (data) {

                    data = data.map(function (d) {
                        // add initial markers
                        if(d.City == "Paris") {
                            $scope.markers.push({
                                lat: +d.Lat, // convert lat/lon into number
                                lng: +d.Lon,
                                focus: false,
                                draggable: false,
                                message: d.Name,
                                icon: restaurant_icons.defaultIcon//restaurant_icons.hasOwnProperty(d.Category) ? restaurant_icons[d.Category] : restaurant_icons.defaultIcon
                            });
                        }
                        // return correct format of data
                        return {lat: +d.Lat, lng: +d.Lon, Name: d.Name, Rating: +d.Rating, City: d.City, Category: d.Category};
                    });

                    dataService.setRawData(data); // sets the data in service object
                    $scope.init();
                });
            });

            // when a city is changed
            $scope.$watch(function(){
                    return cityService.getCenter();
                },
                function(newVal,oldVal) {
                    if(newVal && newVal != oldVal) {
                        $scope.levels = cityService.getCurrentCityLevels();
                        if($scope.levels.length == 1) {
                            $scope.levelInd = 0;
                        }
                        $scope.center = newVal; // map center is updated
                        $scope.updateMarkers(dataService.getFilteredData()); // markers are updated
                        $scope.updateChoroAndLegend(cityService.getSelectedCity(),true);
                        //heatMapService.setData(dataService.getFilteredData(), cityService.getSelectedMax());
                    }

                });

            // when a category is selected in the dropdown
            $scope.$watch(function(){
                    return categoryService.getCurrent();
                },
                function(newVal,oldVal) {
                    if(newVal && newVal != oldVal) {
                        $scope.updateMarkers(dataService.getFilteredData()); // markers are updated
                        $scope.updateChoroAndLegend(cityService.getSelectedCity(),false);
                        //heatMapService.setData(dataService.getFilteredData(),cityService.getSelectedMax());
                    }
                });

            // when radius is changed
            $scope.$watch(function(){
                return intersectService.getRadius();
                },
                function(newVal,oldVal) {
                    if(newVal !== oldVal) {
                        $scope.updateChoroAndLegend(cityService.getSelectedCity(),false);
                        // heatMapService.setData(dataService.getFilteredData(),cityService.getSelectedMax());
                    }
            });

            // when clicked on markers
            $scope.$on('leafletDirectiveMarker.click', function(e, args) {
                // Args will contain the marker name and other relevant information
                if($scope.circle)
                    $scope.mapObj.removeLayer($scope.circle);
                $scope.circle = L.circle(args.leafletEvent.latlng, intersectService.getRadius()).addTo($scope.mapObj);
            });

            $scope.$on('leafletDirectiveMarker.popupclose', function(e, args) {
                if($scope.circle)
                    $scope.mapObj.removeLayer($scope.circle);
            });

    }]);
