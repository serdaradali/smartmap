/**
 * Created by Sedar on 06/03/2015.
 */

angular.module("geoAnalysis")
.controller("heatMapController", ['$scope', 'dataService', 'heatMapService', function($scope, dataService, heatMapService) {

        /* We simply pick up the SVG from the map object */

        $(".dropdown-menu li a").click(function(){

            $(".btn:first-child").html(
                $(this).text()+" <span class=\"caret\"></span>"
            );
            $(".btn:first-child").val($(this).text());
            //updateData($(this).text());
            dataService.filterByCity(city);

        });

        angular.extend($scope,{
            svg: d3.select("#map").select("svg"),
            g : svg.append("g"),
            heatmapLayer: new HeatmapOverlay(heatMapService.cfg)
        });

        $heatmapLayer.setData(restData);

        angular.extend($scope, {
            drawPoints: function() {

                var feature = $scope.g.selectAll("circle")
                    .data(dataService.get)
                    .enter().append("circle")
                    .style("stroke", "black")
                    .style("opacity", .6)
                    .style("fill", "white")
                    .attr("r", 3)
                    .on("mouseover", function (d, i) {
                        tooltip.style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 10) + "px")
                            .style("opacity", 1)
                            .style("pointer-events", "none")
                            .html(function () {

                                var title = '<h4>' + rows[i].name + '</h4>';

                                return title;

                            });
                    })
                    .on("mouseout", function (d) {
                        //tooltip.style("opacity",0);
                    });
            }
        })

    }]);
