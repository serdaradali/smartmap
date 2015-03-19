/**
 * Created by Sedar on 11/03/2015.
 */

angular.module("geoAnalysis")
    .controller("yelpController",['$scope', 'MyYelpAPI', 'cityService','choroService', 'divisionRestaurants',
        function($scope, MyYelpAPI, cityService, choroService, divisionRestaurants){
            $scope.DIVISION_REST_LIMIT = 10;
            $scope.businesses = [];
            $scope.regionClicked = false;
            $scope.bounds = [];
            $scope.callCount = 0;
            $scope.offsetCount = 0;
            $scope.division = "";
            $scope.divisionCallCount = 0;
            $scope.filterText = '';
            $scope.rowData = [];
            $scope.columns = [{field:'name', displayName:'Name',
                width:"35%",cellTemplate: '<div  ng-click="goToWeb(row)" ng-bind="row.getProperty(col.field)"></div>'},
                {field:'type', displayName:'Type', width:"20%"},
                {field:'review_count', displayName:'Reviews', width:"20%"},
                {field:'rating', displayName:'Rating', width:"15%"}];
            angular.extend($scope, {
                gridOptions: {
                    data: 'rowData',
                    showSelectionCheckbox: true,
                    columnDefs: 'columns',
                    enablePaging: true,
                    showFooter: false,
                    pagingOptions: {
                        pageSize: 15,
                        currentPage: 1
                    },
                    sortInfo:{ fields: ['review_count','rating'], directions: ['desc','desc']},
                    enableColumnResize: true,
                    multiSelect: true,
                    filterOptions: {filterText: $scope.filterText, useExternalFilter: false},
                    showFilter: true
                }
            });

            $scope.updateRecommendations = function(isMore) {
                if(!isMore) {
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
                    MyYelpAPI.retrieveYelp($scope.bounds, $scope.callCount, $scope.offsetCount, function (data) {
                        //$scope.rowData = [];
                        //$scope.businesses = data.businesses;
                        for (var i = 0; i < data.businesses.length; i++) {
                            var b = data.businesses[i];
                            var type = b.categories ? b.categories[0][0].toString() : "";
                            $scope.rowData.push({
                                'name': b.name, 'type': type,
                                'review_count': b.review_count, 'rating': b.rating, 'url': b.url
                            });
                        }
                        //$scope.gridOptions.sortBy('rating');
                        divisionRestaurants.setRest(city, $scope.division, $scope.rowData);
                        $scope.callCount++;
                        $scope.divisionCallCount++;
                        if ($scope.divisionCallCount < $scope.DIVISION_REST_LIMIT) {
                            $scope.updateRecommendations(true);
                        }
                    });
                } /*else { // recommendations for this city & division already exist.
                    $scope.rowData = rests;
                }*/
            }

            $scope.goToWeb = function(row) {
                var index = $scope.rowData.indexOf(row.entity);
                window.open($scope.rowData[index].url);
            }

            $scope.$watch(function(){
                    return cityService.getCenter();
                },
                function(newVal,oldVal) {
                    if(newVal && newVal != oldVal) {
                        $scope.rowData = [];
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
                        cityService.setCurrentDivision(newVal.ind);
                        $scope.division = cityService.getCurrentDivision();
                        $scope.regionClicked = true;
                    }
                },true);

            $scope.getRecommendations = function(){
                cityService.getPolygonStatus2().then(function() {
                    $scope.rowData = [];
                    $scope.divisionCallCount = 0;
                    $scope.updateRecommendations();
                    /*for(var i=0;i<5;i++) {
                     $scope.updateRecommendations(true);
                     }*/
                });
            }
        }])
