/**
 * Created by Sedar on 06/03/2015.
 */

angular.module("geoAnalysis")
.factory("heatMapService",['leafletData', function(leafletData) {

        var radiusValues = {"4":333,"6":(333/4)*6,"9":(333/4)*9},mxValues = {"4":20,"6":30,"9":45},
            colorScale = ['0.02','0.2','0.6','0.8','0.99'],
            colorValues = ["rgb(255,255,178)","rgb(254,204,92)","rgb(253,141,60)","rgb(240,59,32)","rgb(189,0,38)"],
            defaultMax = 50;

        var mapObj = {}

        var restData = {},restDataDetailed, cfg = {},
            limits = [4000,6000,9000], DEFAULT_ZOOM = 13, EARTH_C = 40075; // earth circumference in kilometers

        var pixelDistance = function (lat,zoomLevel) {
            return (EARTH_C*1000) * Math.abs(Math.cos(lat*(Math.PI/180)))/Math.pow(2,(zoomLevel+8));
        };

        var radius = {
            value: 400,//limits[0]/(pixelDistance(2.338820,DEFAULT_ZOOM)),
            absolute: true
        }; //* widthRatio);

        var cfg = {
                // radius should be small ONLY if scaleRadius is true (or small radius is intended)
                "radius": radiusValues["4"]/8192, // if scaleRadius is false, this value is in pixels
                "maxOpacity": .75,
                "minOpacity": 0,
                // scales the radius based on map zoom
                "scaleRadius": true,
                // if set to false the heatmapOverlay uses the global maximum for colorization
                // if activated: uses the data maximum within the current map boundaries
                //   (there will always be a red spot with useLocalExtremas true)
                "useLocalExtrema": false,
                "blur": .1,
                // which field name in your data represents the latitude - default "lat"
                latField: 'lat',
                // which field name in your data represents the longitude - default "lng"
                lngField: 'lng',
                // which field name in your data represents the data value - default "value"
                valueField: 'count',
                gradient: {}
                /*gradient: {
                 '.1': "rgb(189,0,38)",
                 '.2': "rgb(240,59,32)",
                 '.4': "rgb(253,141,60)",
                 '.6': "rgb(254,178,76)",
                 '.8': "rgb(254,217,118)",
                 '.99': "rgb(255,255,178)"}*/
            };


        var setColorScale = function(values) {
            colorScale = values;
            cfg.gradient = {};
            for(var i=0;i<colorScale.length;i++) {
                cfg.gradient[colorScale[i]] = colorValues[i];
            }
        }

        setColorScale(colorScale);
        var heatMapLayer = new HeatmapOverlay(cfg);

        var setData = function(data,mx) {
            if(!mx) {
                mx = defaultMax;
            }
            var dataObj = {
                max: mx,
                min: 0,
                data: data
            };
            heatMapLayer.setData(dataObj);
            //heatMapLayer.repaint();
        }

        var setRadius = function(r) {
            cfg.radius = radiusValues[r];
            heatMapLayer = new HeatmapOverlay(cfg);
            //setData(filtered,mxValues[r]);
            var zoom = mapObj.getZoom();
            //mapObj.setZoom(zoom-1);
            mapObj.setZoom(zoom);
        }
        var setMapObj = function(m) {
            mapObj = m;
        }

        var getColorScale = function() {
            return colorScale;
        }

        var getColorValues = function() {
            return colorValues;
        }


        // when the map is ready
        leafletData.getMap().then(function(map) {
            setMapObj(map);
            //heatMapLayer.setZIndex(1)
            map.addLayer(heatMapLayer);
        });

        return {
            cfg: cfg,
            getColorScale: getColorScale,
            setColorScale: setColorScale,
            getColorValues: getColorValues,
            heatmapLayer: heatMapLayer,
            setData: setData,
            setRadius: setRadius
        }
    }]);
