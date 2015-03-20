/**
 * Created by Sedar on 12/03/2015.
 */


angular.module("geoAnalysis")
    .factory("intersectService",function() {
        var regions = [], points = [], intersectCount = [], ratingCount = [], mapObj = {}, radius = 1000;

        var pixelDistance = function (lat,zoomLevel) {
            return (40075*1000) * Math.abs(Math.cos(lat*(Math.PI/180)))/Math.pow(2,(zoomLevel+8));
        };

        var init = function(r, p, m) {
            regions = r;
            points = p;
            intersectCount = new Array(regions.features.length);
            ratingCount = new Array(regions.features.length);
        }

        var setMapObj = function(m) {
            mapObj = m;
        }

        var setRadius = function(r) {
            radius = r;
        }

        var getRadius = function() {
            return radius;
        }

        function pointToCircle(p) {
            var temp = mapObj.latLngToContainerPoint(L.latLng(p.lat, p.lng));
            return [temp.x,temp.y,radius/pixelDistance(p.lat,mapObj.getZoom())]
        }

        function regionToEdges(reg) {
            var edges = [];
            for(var i=0;i< reg.length;i++) {
                var p = mapObj.latLngToContainerPoint([reg[i][1],reg[i][0]]);
                edges.push([p.x, p.y]);
            }
            return edges;
        }

        function regionIntensityCalc(ind,reg,points){
            var edges = [];
            var lenC = reg.geometry.coordinates.length;
            var lenP = points.length;
            var max = 0, maxInd = 0;
            // run through different segments of this region if they are disconnected
            if(lenC>1){
                // find the biggest segment ( segment with most points)
                for(var j=0;j<lenC;j++) {
                    if(reg.geometry.coordinates[j][0].length > max) {
                        max = reg.geometry.coordinates[j].length;
                        maxInd = j;
                    }
                }
                edges = regionToEdges(reg.geometry.coordinates[maxInd][0])
            } else {
                edges = regionToEdges(reg.geometry.coordinates[0]);
            }
            intersectCount[ind] = 0;
            ratingCount[ind] = 0;
            var ratingExistCount = 0;
            for(var i=0;i<lenP;i++) {
                var circle = pointToCircle(points[i])
                if(intersects(circle,edges)) {
                    intersectCount[ind]++;
                    if(points[i]) {
                        ratingCount[ind] += points[i].rating;
                        ratingExistCount++;
                    }
                }
            }
            ratingCount[ind] = ratingCount[ind]/ratingExistCount;
        }

        var getCityIntensity = function (){
            for(var i=0;i<regions.features.length;i++) {
                regionIntensityCalc(i,regions.features[i],points)
            }
            return intersectCount;
        }

        var getIntensityCount = function (){
            return intersectCount;
        }

        var getRegionRatings = function() {
            return ratingCount;
        }

        var getCityIntensityCenter = function (){
            var rlen = regions.features.length, plen = points.length;
            for(var i=0;i<rlen;i++) {
                /*var center = d3.geo.centroid(regions.features[i]);
                center = L.latLng(center[1],center[0]);*/
                var bnds = d3.geo.bounds(regions.features[i]);
                bnds = [[bnds[0][1],bnds[0][0]],[bnds[1][1],bnds[1][0]]];
                var center = L.latLngBounds(bnds[0],bnds[1]).getCenter();
                intersectCount[i] = 0;
                ratingCount[i] = 0;
                var ratingExistCount = 0;
                for(var j=0;j<plen;j++) {
                    var dist = center.distanceTo(points[j]);
                    if(dist < radius) {
                        intersectCount[i]++;
                        if(points[j] && points[j].Rating) {
                            ratingCount[i] += points[j].Rating;
                            ratingExistCount++;
                        }
                    }
                }
                if(ratingExistCount == 0) {
                    ratingCount[i] = "NA";
                }else {
                    ratingCount[i] = (ratingCount[i] / ratingExistCount).toFixed(2);
                }
            }
            return intersectCount;
        }

        function intersects(circle, polygon) {
            return pointInPolygon(circle, polygon)
                || polygonEdges(polygon).some(function(line) { return pointLineSegmentDistance(circle, line) < circle[2]; });
        }

        function polygonEdges(polygon) {
            return polygon.map(function(p, i) {
                return i ? [polygon[i - 1], p] : [polygon[polygon.length - 1], p];
            });
        }

        function pointInPolygon(point, polygon) {
            for (var n = polygon.length, i = 0, j = n - 1, x = point[0], y = point[1], inside = false; i < n; j = i++) {
                var xi = polygon[i][0], yi = polygon[i][1],
                    xj = polygon[j][0], yj = polygon[j][1];
                if ((yi > y ^ yj > y) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) inside = !inside;
            }
            return inside;
        }

        function pointLineSegmentDistance(point, line) {
            var v = line[0], w = line[1], d, t;
            return Math.sqrt(pointPointSquaredDistance(point, (d = pointPointSquaredDistance(v, w))
                ? ((t = ((point[0] - v[0]) * (w[0] - v[0]) + (point[1] - v[1]) * (w[1] - v[1])) / d) < 0 ? v
                : t > 1 ? w
                : [v[0] + t * (w[0] - v[0]), v[1] + t * (w[1] - v[1])])
                : v));
        }

        function pointPointSquaredDistance(v, w) {
            var dx = v[0] - w[0], dy = v[1] - w[1];
            return dx * dx + dy * dy;
        }

        return {
            init: init,
            getCityIntensity: getCityIntensity,
            getRegionRatings: getRegionRatings,
            getCityIntensityCenter: getCityIntensityCenter,
            setRadius: setRadius,
            getRadius: getRadius,
            setMapObj: setMapObj,
            getIntensityCount: getIntensityCount
        }
    })