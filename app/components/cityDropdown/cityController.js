/**
 * Created by Sedar on 09/03/2015.
 */

angular.module("geoAnalysis")
    .controller("cityController",['$scope', 'cityService', 'dataService', function($scope, cityService, dataService){

        angular.extend($scope, {
            cities: cityService.cities,
            current: "Paris",
            setCity: function(cityObj) {
                $scope.current = cityObj.name;

                // filter data
                dataService.filterByCity(cityObj.name);

                // change city properties
                cityService.setCenter(cityObj.center);
                cityService.setSelectedCity(cityObj.name);
            }
        })
    }]);
