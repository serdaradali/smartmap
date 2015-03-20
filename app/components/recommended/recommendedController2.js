/**
 * Created by Sedar on 11/03/2015.
 */

angular.module("geoAnalysis")
    .controller("yelpController",['$scope', 'MyYelpAPI', 'cityService','choroService', 'divisionRestaurants', 'uiGridConstants',
        function($scope, MyYelpAPI, cityService, choroService, divisionRestaurants, uiGridConstants){
            var count = 0;
            $scope.DIVISION_REST_LIMIT = 20;
            $scope.businesses = [];
            $scope.regionClicked = false;
            $scope.bounds = [];
            $scope.callCount = 0;
            $scope.offsetCount = 0;
            $scope.division = "";
            $scope.divisionCallCount = 0;
            $scope.filterText = '';
            //$scope.rowData = [];
            $scope.columns = [{field:'name', name:'Name',
                width:"35%"},
                {field:'type', name:'Type', width:"20%", filter: {
                    condition: function(searchTerm, cellValue) {
                        var strippedValue = (cellValue + '').replace(/[^\d]/g, '');
                        return strippedValue.indexOf(searchTerm) >= 0;
                    }
                }},
                {field:'review_count', name:'Reviews', width:"20%",sort: {
                    direction: uiGridConstants.DESC,
                    priority: 0
                }},
                {field:'rating', name:'Rating', width:"15%", sort: {
                    direction: uiGridConstants.DESC,
                    priority: 1
                }}];
            angular.extend($scope, {
                gridOptions: {
                    data: [],
                    showSelectionCheckbox: true,
                    columnDefs: $scope.columns,
                    enableRowSelection: true
                }
            });

            function parseData(data) {
                //$scope.rowData = [];
                //$scope.businesses = data.businesses;
                if(data.businesses.length == 20) {
                    console.log(count++);
                }
                for (var i = 0; i < data.businesses.length; i++) {
                    var b = data.businesses[i];
                    var type = b.categories ? b.categories[0][0].toString() : "";
                    $scope.gridOptions.data.push({
                        'name': b.name, 'type': type,
                        'review_count': b.review_count, 'rating': b.rating, 'url': b.url
                    });
                }
                //$scope.gridOptions.sortBy('rating');
                //divisionRestaurants.setRest(city, $scope.division, $scope.rowData);
                $scope.callCount++;
                $scope.divisionCallCount++;
                if (data.businesses.length == 20 && ($scope.divisionCallCount < $scope.DIVISION_REST_LIMIT) ) {
                    $scope.updateRecommendations(false);
                }
            }

            $scope.updateRecommendations = function(isFirst) {
                if(isFirst) {
                    $scope.offsetCount = 0;
                }
                else {
                    $scope.offsetCount++;
                }
                $scope.bounds = cityService.getCurrentDivisionBounds();
                var city = cityService.getSelectedCity();
                /*TODO: Cache restaurants once API is called
                 */
                //var rests = divisionRestaurants.getRests(city,$scope.division); // this is for caching
                if(true) { //!rests || $scope.offsetCount > 0
                    MyYelpAPI.retrieveYelp($scope.bounds, $scope.callCount, $scope.offsetCount, parseData);
                } /*else { // recommendations for this city & division already exist.
                 $scope.rowData = rests;
                 }*/
            }

            $scope.goToWeb = function(row) {
                var index = $scope.gridOptions.data.indexOf(row.entity);
                window.open($scope.gridOptions.data[index].url);
            }

            $scope.gridOptions.onRegisterApi = function(gridApi){
                //set gridApi on scope
                $scope.gridApi = gridApi;
                gridApi.selection.on.rowSelectionChanged($scope,function(row){
                    window.open(row.entity.url);
                });
            };

            $scope.$watch(function(){
                    return cityService.getCenter();
                },
                function(newVal,oldVal) {
                    if(newVal && newVal != oldVal) {
                        $scope.gridOptions.data= [];
                        $scope.division = "";
                        $scope.regionClicked = false;
                    }
                });

            // when clicked on a region
            $scope.$watch(function(){
                    return choroService.selectedDivisionIndex();
                },
                function(newVal,oldVal) {
                    if(newVal.ind !== -1) {// if it is not the default value
                        $scope.gridOptions.data = [];
                        $scope.divisionCallCount = 0;
                        //$scope.callCount = 0;
                        $scope.offsetCount = 0;
                        cityService.setCurrentDivision(newVal.ind);
                        $scope.division = cityService.getCurrentDivision();
                        $scope.regionClicked = true;
                    }
                },true);

            $scope.getRecommendations = function(){
                cityService.getPolygonStatus2().then(function() {
                    $scope.updateRecommendations(true);
                    /*for(var i=0;i<5;i++) {
                     $scope.updateRecommendations(true);
                     }*/
                });
            }
        }])
