angular.module('fasa7ny')
    .filter('searchFilter', function () {
        return function (input, filterCategory, minRating, filterArea) {
            if (typeof input == 'undefined' || input.length == 0) { return input }

            var out = [];
            if (filterCategory != null && typeof filterCategory != 'undefined') {
                filterCategory = filterCategory.toLowerCase();

            }
            // if(filterArea != null && typeof filterArea != 'undefined') {
            //     filterArea = filterArea.toLowerCase(); 
            // }
            
            for (var i = 0; i < input.length && typeof input[i] != 'undefined'; i++) {
                var categoryF = true;
                var ratingF = true;
                var areaF = true;
                if (typeof input[i] == 'undefined')
                    return;

                var categories = input[i].category; //array of business categories

                if (filterCategory == 'all' || filterCategory == '' || typeof filterCategory == 'undefined') { //selected categories is all 
                    categoryF = true; // display all
                } else {
                    if (typeof categories == 'undefined') { // business has no categories 

                        categoryF = false; //don't display it 
                    } else {
                        categoryF = false; //check if business has filter category
                        for (var j = 0; typeof categories[j] != 'undefined' && j < categories.length; j++) {
                            if (categories[j].toLowerCase() == filterCategory) {

                                categoryF = true;
                            }
                        }
                    }
                }

                if (filterArea == 'all' || filterArea == '' || typeof filterArea == 'undefined') {
                    areaF = true;
                } else {
                    if (typeof input[i].area == 'undefined')
                        areaF = false;
                    else if (input[i].area == filterArea)
                        areaF = true;
                    else
                        areaF = false;
                }
                if (minRating == '' || typeof minRating == 'undefined' || minRating == null) {
                    ratingF = true;
                } else {
                    if (typeof input[i].average_rating == 'undefined') {
                        ratingF = false;
                    } else {
                        ratingF = (input[i].average_rating >= minRating);
                    }
                }



                if (categoryF && ratingF && areaF)
                    out.push(input[i]);
            }

            return out;
        }
    })
    .filter('empty', function () {
        return function (rows) {
            if (typeof rows == 'undefined' || rows.length == 0) return;
            var out = [];
            for (var i = 0; i < rows.length; i++) {
                if (typeof rows[i] != 'undefined' && rows[i].length > 0)
                    out.push(rows[i]);
            }
            return out;
        }
    }) 