/**
 * Created by Sedar on 13/03/2015.
 */

angular.module("geoAnalysis")
    .controller("restController",['$scope', 'dataService','cityService',
        function($scope, dataService, cityService){
            $scope.city = "";
            $scope.rowData = [];
            $scope.total = 0;
            $scope.columns = [{field:'name', displayName:'Name', width:"50%"},
                {field:'type', displayName:'Type', width:"50%"}];

            angular.extend($scope, {
                gridOptions: {
                    data: 'rowData',
                    showSelectionCheckbox: true,
                    columnDefs: 'columns'
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
                    $scope.rowData = [];
                    for(var i=0;i<newVal.length;i++) {
                        $scope.rowData.push({'name':newVal[i].Name, 'type':newVal[i].Category});
                    }
                    $scope.total = $scope.rowData.length;
                    $scope.city = cityService.getSelectedCity();
                }
            },true)

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
