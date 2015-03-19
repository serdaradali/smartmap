angular.module('leaflet-choropleth-directive2', ['leaflet-directive']).config(function($provide){
    'use strict';

    $provide.decorator('leafletDirective', function($delegate){
        // Just adding the scope variable called 'hexbin'
        $delegate[0].$$isolateBindings.choropleth= {
            attrName: 'choropleth',
            mode: '=',
            optional: true
        };

        return $delegate;
    });
});
angular.module('leaflet-choropleth-directive2').directive('choropleth', ['choroService',function(choroService) {
    'use strict';

    return {
        restrict : 'A',
        scope : false,
        replace : false,
        require : 'leaflet',
        link : function(scope, element, attrs, controller) {

            // Get the leaflet scope from the parent leaflet controller
            var leafletScope = controller.getLeafletScope();

            controller.getMap().then(function(map) {
                var choroLayer = choroService.choroLayer(leafletScope.choropleth.config).addTo(map);
                var temp = leafletScope.choropleth;

                // Watch the choroplethOverlay scope data variable
                /*leafletScope.$watch('choropleth.data', function(){
                    var dataMax = Math.max.apply(null,leafletScope.choropleth.data);
                    choroLayer.data(leafletScope.choropleth.data, dataMax);
                },true);*/

                leafletScope.$on("dataChanged", function() {
                    var dataMax = Math.max.apply(null,leafletScope.choropleth.data);
                    choroLayer.data(leafletScope.choropleth.data, dataMax);
                });

                // Watch the choroplethOverlay scope polygon variable
                leafletScope.$on("polygonChanged", function() {
                    choroLayer.jsonFeature(leafletScope.choropleth.jsonFeature);
                });

                // Watch the choroplethOverlay scope polygon variable
                leafletScope.$watchCollection('choropleth.ratings', function(){
                    choroLayer.ratings(leafletScope.choropleth.ratings);
                });

                // Watch the choroplethOverlay scope polygon variable
                leafletScope.$watchCollection('choropleth.colorScale', function(){
                    choroLayer.colorScale(leafletScope.choropleth.colorScale);
                });

                // Watch the choroplethOverlay layer status variable
                leafletScope.$watchCollection('choropleth.layerStatus', function(){
                    choroLayer.layerStatus(leafletScope.choropleth.layerStatus);
                });

                // it is important that first data updates
                choroLayer.data(leafletScope.choropleth.data, leafletScope.choropleth.max);
                choroLayer.jsonFeature(leafletScope.choropleth.jsonFeature);
            });

        }
    };
}]);