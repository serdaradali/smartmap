/**
 * Created by Sedar on 13/03/2015.
 */

angular.module("geoAnalysis")
    .controller("restController",['$scope', 'dataService','cityService','choroService','uiGridConstants',
        function($scope, dataService, cityService, choroService,uiGridConstants){
            $scope.city = "";
            $scope.total = 0;
            $scope.columns = [{name:'name', field:'Name'},
                {name:'type', field:'Type'}, {name:'rating', field:'Rating', sort: {
                    direction: uiGridConstants.DESC,
                    priority: 0
                }}];

            angular.extend($scope, {
                gridOptions: {
                    data: [],
                    columnDefs: $scope.columns,
                    enableFiltering: true
                }
            });

            $scope.markerDisplay = function(bool) {
                if(!bool)
                {
                    $('.leaflet-marker-pane').css("display","none");
                }
                else{
                    $('.leaflet-marker-pane').css("display","block");
                }
            }

            $scope.$watch(function(){
                return  dataService.getFilteredData();
            },function(newVal,oldVal) {
                if(newVal.length > 0) {
                    $scope.gridOptions.data = [];
                    for(var i=0;i<newVal.length;i++) {
                        $scope.gridOptions.data.push({'Name':newVal[i].Name, 'Type':newVal[i].Category, 'Rating':newVal[i].Rating});
                    }
                    $scope.total = $scope.gridOptions.data.length;
                    $scope.city = cityService.getSelectedCity();
                }
            },true)

            // when clicked on a region
            $scope.$watch(function(){
                    return choroService.selectedDivisionIndex();
                },
                function(newVal,oldVal) {
                    if(newVal.ind !== -1) {// if it is not the default value
                        cityService.setCurrentDivision(newVal.ind);
                        $scope.city = cityService.getCurrentDivision();
                    }
                },true);

            // when a category is selected in the dropdown
            /*$scope.$watch(function(){
                    return categoryService.getCurrent();
                },
                function(newVal,oldVal) {
                    if(newVal && newVal != oldVal) {
                        $scope.rowData = dataService.getFilteredData();
                    }
                });*/

        }]);
