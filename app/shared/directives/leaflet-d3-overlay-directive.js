/**
 * Created by Sedar on 09/03/2015.
 */

/*! angular-leaflet-directive-ext Version: 0.3.1 */
angular.module('leaflet-d3-overlay-directive', ['leaflet-directive']).config(function($provide){
    'use strict';

    $provide.decorator('leafletDirective', function($delegate){
        // Just adding the scope variable called 'hexbin'
        $delegate[0].$$isolateBindings.choropleth= {
            attrName: 'heatmap',
            mode: '=',
            optional: true
        };

        return $delegate;
    });
});
angular.module('leaflet-d3-overlay-directive').directive('heatmap', function() {
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
                //var choroLayer = L.choroLayer(leafletScope.choroplethOverlay.config).addTo(map);
                //var temp = leafletScope.choroplethOverlay;
            });

        }
    };
});
