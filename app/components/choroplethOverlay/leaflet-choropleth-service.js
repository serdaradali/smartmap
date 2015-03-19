/*! leaflet-d3.js Version: 0.2.6 */
(function(){
    "use strict";

    angular.module("geoAnalysis")
        .factory("choroService",function() {

            var maxValue = 1;

            var choroLayerObj = {};

            var selectedDivisionInd = {ind:-1};


            var choroLayer = function (options) {
                choroLayerObj = new L.ChoroplethLayer(options)
                return choroLayerObj;
            };

            // L is defined by the Leaflet library, see git://github.com/Leaflet/Leaflet.git for documentation
            L.ChoroplethLayer = L.Class.extend({
                includes: [L.Mixin.Events],

                options: {
                    opacity: 0.2,
                    duration: 400,
                    lng: function (d) {
                        return d[0];
                    },
                    lat: function (d) {
                        return d[1];
                    },
                    value: function (d) {
                        return d.length;
                    },
                    valueFloor: undefined,
                    valueCeil: undefined,
                    colorRange: ["rgba(255,255,178,0.8)", "rgba(254,217,118,0.8)", "rgba(254,178,76,0.8)", "rgba(253,141,60,0.8)", "rgba(240,59,32,0.8)", "rgba(189,0,38,0.8)"]
                },

                initialize: function (options) {
                    L.setOptions(this, options);

                    // function that will draw polygon geometry
                    this._path = d3.geo.path().projection(this._project);
                    this._tooltip = d3.select("body").append("div")
                        .attr("class", "tooltip")
                        .style("opacity", 0);
                    this._data = [];
                    this._ratings = [];
                    this._intensity = [];
                    this._jsonFeature = {};
                    this._colorScale = d3.scale.threshold()
                        .domain([0.1, 0.2, 0.4, 0.6, 0.8, 1.01])
                        .range(this.options.colorRange);

                },

                // this is called when overlay is added??
                onAdd: function (map) {
                    this._map = map;
                    window.backUpMap = map;

                    // Create a container for svg.
                    this._container = this._initContainer();

                    // Set up events
                    //map.on({'moveend': this._redraw}, this);
                    map.on({"viewreset": this._viewReset}, this);
                    //map.on({"load": this._redraw}, this); // this makes sure that we draw initially only after the map is ready

                },

                onRemove: function (map) {
                    this._destroyContainer();

                    // Remove events
                    map.off({'moveend': this._redraw}, this);

                    this._container = null;
                    this._map = null;
                    this._data = null;
                },

                addTo: function (map) {
                    map.addLayer(this, true);
                    return this;
                },

                _initContainer: function () {
                    var container = null;

                    // If the container is null or the overlay pane is empty, create the svg element for drawing
                    if (null == this._container) {
                        var overlayPane = this._map.getPanes().overlayPane;
                        container = d3.select(overlayPane).append('svg')
                            .attr('class', 'leaflet-layer leaflet-zoom-hide');
                    }

                    return container;
                },

                _destroyContainer: function () {
                    // Remove the svg element
                    if (null != this._container) {
                        this._container.remove();
                    }
                },

                _viewReset: function () {
                    var g = this._redrawSvg();
                    if (!this._map || !this._jsonFeature.hasOwnProperty("features")) {
                        return 0;
                    }
                    else {
                        g.selectAll('path.choro-mesh').attr('d', this._path);
                    }

                },

                // This is called if zoom changed or map dragged or anything that updates boundaries
                _redrawSvg: function () {

                    if (!this._map || !this._jsonFeature.hasOwnProperty("features")) {
                        return 0;
                    }
                    else {

                        var bottomLeft = this._project(this._bounds[0]);
                        var topRight = this._project(this._bounds[1]);


                        var width = topRight[0] - bottomLeft[0],
                            height = bottomLeft[1] - topRight[1],
                            marginTop = topRight[1],
                            marginLeft = bottomLeft[0];

                        /*this._container.selectAll('g')
                         .filter(function(d){
                         return this.attr() != "choroplethLayer"
                         })*/

                        this._container
                            .attr('width', width).attr('height', height)
                            .style('margin-left', marginLeft + 'px')
                            .style('margin-top', marginTop + 'px');

                        // Select the choroplethOverlay layer
                        var join = this._container.selectAll('g.choroplethLayer')
                            .data([this._jsonFeature]);

                        // enter
                        join.enter().append('g')
                            .attr('class', "choroplethLayer");

                        // enter + update
                        join.attr('transform', 'translate(' + -marginLeft + ',' + -marginTop + ')');

                        // exit
                        join.exit().remove();

                        return join;
                    }

                },

                // this is the case when data is updated but polygon information stays the same
                _redrawColor: function () {

                    var that = this;

                    if (!this._map || !this._jsonFeature.hasOwnProperty("features") || this._data.length == 0) {
                        return;
                    }
                    else {

                        var g = this._container.selectAll('g.choroplethLayer');
                        var join = g.selectAll('path.choro-mesh');
                        join.attr('fill', function (d, i) {
                            return that._colorScale(that._data[i]/maxValue);
                        })
                            /*.transition().duration(this.options.duration)*/
                            .attr("opacity", that.options.opacity);
                    }
                },

                // (Re)draws the choroplethOverlay group. Leaflet also calls this function in the beginning as a result of view reset event.
                _redraw: function () {
                    if (this._map && this._jsonFeature.hasOwnProperty("features")) {
                        var join = this._redrawSvg();
                        this._createChoropleth(join);
                    } else {
                        console.log("Missing data: Intensity data is not provided");
                        return;
                    }
                },

                _createChoropleth: function (g) {
                    var that = this;

                    g.selectAll('path.choro-mesh').remove();

                    // Bind data to choroplethOverlay container g
                    var join = g.selectAll('path.choro-mesh')
                        .data(that._jsonFeature.features);

                    // Enter - establish the path, the fill, and the initial opacity
                    var a = join.enter().append('path').attr('class', 'choro-mesh')
                        .attr('d', that._path)
                        .attr('fill', 'rgba(255,255,255,0')
                        .on("mouseover", function (d, i) {
                            //createTooltip(d);
                            d3.select(this).classed("active", true);

                            that._tooltip/*.style("left", (d3.event.pageX) + "px")
                                .style("top", (d3.event.pageY + 10) + "px")
                                */.style("opacity", 1)
                                .style("pointer-events", "none")
                                .html(function () {

                                    var title = "";

                                    if(d.hasOwnProperty("properties") && d.properties.hasOwnProperty("name")) {
                                        title +=  '<h5 style="text-decoration: underline;">' + d.properties.name + '</h5>';
                                    }

                                    title += '<p>' + 'Restaurants: ' + '<strong style="font-size: 15px">' + that._data[i] + '</strong>'+ '</p>'
                                    + '<p>' + 'Rating: ' + '<strong style="font-size: 15px">' + that._ratings[i] + '</p>';

                                    return title;

                                });
                        })
                        .on("mouseout", function (d) {
                            d3.select(this).classed("active", false);
                            that._tooltip.style("opacity", 0);
                        })
                        .on("click", function (d,i) {
                            selectedDivisionInd.ind = i;
                            d3.selectAll("path.choro-mesh").classed("selected", false);
                            d3.select(this).classed("selected", true);
                        });
                    if (this._data && this._data.length !== 0) {
                        a.attr('fill', function (d, i) {
                            if(!(that._colorScale(that._data[i]/maxValue))) {
                                console.log(that._data[i]);
                            }
                            return that._colorScale(that._data[i]/maxValue);
                        })
                            .attr('opacity', that.options.opacity)
                    }

                    // Exit
                    join.exit()
                        .remove();

                },

                _project: function (coord) {
                    var point = window.backUpMap.latLngToLayerPoint([coord[1], coord[0]]);
                    return [point.x, point.y];
                },

                /*
                 * Setter for the data
                 */
                data: function (data,mVal) {
                    if (data) {
                        this._data = data;
                        maxValue = mVal || 1;
                        this._redrawColor();
                    }
                    else {
                        this._data = [];
                        console.log("intensity for choroplethOverlay data is null");
                    }
                    return this;
                },


                /*
                 * Setter for the data
                 */
                ratings: function (data) {
                    if (data) {
                        this._ratings = data;
                    }
                    else {
                        this._ratings = [];
                        console.log("intensity for choroplethOverlay data is null");
                    }
                    return this;
                },

                /*
                 * Setter for the polygon data
                 */
                jsonFeature: function (json) {
                    if (json) {
                        this._jsonFeature = json;
                        // boundaries of polygon shape of selected city in world coordinates
                        this._bounds = d3.geo.bounds(this._jsonFeature); // get the geographic boundaries of polygons
                        this._redraw();
                    }
                    else {
                        this._jsonFeature = {};
                        console.log("choroplethOverlay polygon data is null");
                    }
                    return this;
                },

                /*
                 * Getter/setter for the colorScale
                 */
                colorScale: function (colorScale) {
                    if (undefined === colorScale) {
                        return this._colorScale;
                    }

                    this._colorScale = colorScale;
                    this._redraw();
                    return this;
                },

                layerStatus: function (status) {

                    d3.selectAll("g.choroplethLayer")
                        .style("display", status);
                },

                /*
                 * Getter/Setter for the value function
                 */
                value: function (valueFn) {
                    if (undefined === valueFn) {
                        return this.options.value;
                    }

                    this.options.value = valueFn;
                    //this._redraw();
                    return this;
                }

            });

            var getSelectedDivisionIndex = function() {
                return selectedDivisionInd;
            }

            return {
                choroLayer: choroLayer,
                selectedDivisionIndex: getSelectedDivisionIndex
            }
        });

})();

