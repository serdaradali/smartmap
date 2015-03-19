/**
 * Created by Sedar on 09/03/2015.
 */

angular.module("geoAnalysis")
    .controller("rangeController",['$scope', 'heatMapService', 'intersectService',function($scope, heatMapService, intersectService){

        angular.extend($scope, {
            ranges: [1,2,3,4,6,9],
            current: 4,
            setRange: function(val) {
                $scope.current = val;
                heatMapService.setRadius(val);
                intersectService.setRadius(val*1000);
                //dataService.filterByCity(cityObj.name);
            }
        })
    }]);
