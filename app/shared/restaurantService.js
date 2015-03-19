/**
 * Created by Sedar on 06/03/2015.
 */

angular.module("geoAnalysis")
    .factory("dataService",function() {

        var rawData, filteredData = {}, cityData = {},
            categoryData = {}, cityFilter, categoryFilter;
        var dataPromise = {};

        var readData = function() {
            dataPromise =  d3.promise.csv("assets/data/restoInDataDetailed2.csv");
            return dataPromise;
        }

        var getFilteredData = function() {
            return filteredData;
        }

        var setRawData = function(data) {
            categoryData = data.slice(0);
            rawData = data;
            cityData = data.slice(0);
        }

        var filterByCity = function(city) {
            //cityFilter = city;
            filteredData = categoryData.filter(function(row){
                return row.City == city;
            });
            cityData = filteredData.slice(0);

        };

        var filterByCategory = function(category) {
            //categoryFilter = category;
            if(category == "All") {
                filteredData = cityData.slice(0);
            }
            else {
                filteredData = cityData.filter(function (row) {
                    return row.Category == category;
                });
            }
        }

        /*var getIntersectionCounts = function(radius) {
            var len = filteredData.length;
            var intersects = new Array(len);
            for(var j=0;j<len;j++) {
                var p = L.latLng(filteredData[j].lat,filteredData[j].lng);
                intersects[j] = 0;
                for(var i=0;i<len;i++) {
                    if(i!=j) {
                        var pOther = L.latLng(filteredData[i].lat, filteredData[i].lng);
                        if (p.distanceTo(pOther) < (radius*1000)) {
                            intersects[j]++;
                        }
                        ;
                    }
                }
            }
        }*/

        var getDataStatus = function() {
            return dataPromise;
        }

        return {
            getFilteredData: getFilteredData,
            filterByCity: filterByCity,
            filterByCategory: filterByCategory,
            readData: readData,
            setRawData: setRawData,
            getDataStatus: getDataStatus
        }
    });
