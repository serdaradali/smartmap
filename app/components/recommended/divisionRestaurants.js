/**
 * Created by Sedar on 13/03/2015.
 */

angular.module("geoAnalysis")
    .factory("divisionRestaurants", function() {

        var data = {};

        var setRest = function (c, division, results) {
            if(!data.hasOwnProperty(c)) {
                var obj = {};
                obj[division] = results;
                data[c] = obj;
            }
            else if(!data[c].hasOwnProperty(division)){
                data[c][division] = results;
            }
        }
        var getRests = function(c,div){
            if(data.hasOwnProperty(c) && data[c].hasOwnProperty(div))
                return data[c][div];
            else {
                return null;
            }
        }
        return {
            getRests: getRests,
            setRest: setRest
        }
    })
