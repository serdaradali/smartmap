/**
 * Created by Sedar on 06/03/2015.
 */

angular.module("geoAnalysis")
    .factory("categoryService",function() {

        var current = "All";

        var categories = [
            "All",
            "italian",
            "indian",
            "japanese",
            "thai",
            "american",
            "Pâtisserie",
            "lebanese",
            "french",
            "",
            "chinese",
            "brasserie",
            "Spanish",
            "Burger",
            "mediterranean",
            "mexican",
            "greek",
            "Moroccan",
            "Modern",
            "international",
            "crepes",
            "fruits de mer",
            "Arrocería",
            "oriental",
            "Salad bar",
            "vegetarian",
            "Asian",
            "Belge",
            "Flowers",
            "german",
            "Helados",
            "russian",
            "Sandwich",
            "tapas",
            "undefined",
            "Vietnamita",
            "bagel",
            "castellana",
            "catalana",
            "South American",
            "vegan",
            "african",
            "arabic",
            "argentinian",
            "austrian",
            "Bagel & Burger",
            "balls",
            "Bavarian",
            "Brunch",
            "canaria",
            "Chocolatier",
            "crossover kitchen",
            "Danish",
            "english",
            "exotic",
            "Franco Ivoirien",
            "Fusion",
            "Iranian",
            "Pakistani",
            "Portuguese",
            "Roaster",
            "sud-ouest",
            "Sushis Noodles & Wok",
            "Syrian",
            "tunisian",
            "Vasco",
            "world"
        ];

        var getCategories = function() {
            return categories;
        }

        var setCategory = function(category) {
            var filtered = {};

            if(category == "All") {
                filtered = cityData;
            }
            else {
                filtered = filteredData.filter(function (row) {
                    return row.Category == category;
                });
            }

            return filtered;
        }

        var setCurrent = function(c) {
            current = c;
        }

        var getCurrent = function() {
            return current;
        }

        return {
            getCategories: getCategories,
            setCategory: setCategory,
            getCurrent: getCurrent,
            setCurrent: setCurrent
        }

    });
