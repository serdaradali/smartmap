/**
 * Created by Sedar on 09/03/2015.
 */

angular.module("geoAnalysis")
    .controller("categoryController",['$scope', 'categoryService', 'dataService', function($scope, categoryService, dataService){

        angular.extend($scope, {
            categories: categoryService.getCategories(),
            current: categoryService.getCurrent(),
            setCategory: function(category) {
                categoryService.setCurrent(category);
                $scope.current = category;
                dataService.filterByCategory(category);
            }
        })

        /*$scope.$watch(function(){
                return categoryService.getCurrent();
            },
            function(newVal,oldVal) {
                $scope.current = newVal;
            });*/
    }]);