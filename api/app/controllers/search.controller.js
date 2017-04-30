var mongoose = require('mongoose');
var Business = mongoose.model('Business');

SearchController = {

    showAll: function (req, res) {
        Business.find({ public: 1 }).
            exec(function (err, result) {
                if (err) {
                    res.status(500).json('Oops..something went wrong.');
                }
                else {
                    res.status(200).json(result);
                }

            });
    }
}

//module that contains helper methods to the SearchController
helper = {
    /**
     * Extracts the relevent information from formData input
     * and returns the body of the query to be executed
     */
    makeQuery: function (formData) {

        var keyword = formData.keyword || ""; //text search index over name, description and area (no substring)
        var category = formData.category || "";
        var area = formData.area || "";
        var minRating = formData.minRating || "";

        var query = {};

        //match any substring with name, description or area to search keyword
        if (keyword.length > 0) {
            query["$or"] = [
                { name: new RegExp(keyword, 'i') },
                { description: new RegExp(keyword, 'i') },
                { area: new RegExp(keyword, 'i') }
            ];
        }

        // add filters one by one, according to user input
        var anding = [];
        if (category.length > 0) {
            anding.push({ category: new RegExp(category, 'i') });
        }
        if (area.length > 0) {
            anding.push({ area: new RegExp(area, 'i') });
        }
        if (minRating.length > 0) {
            var minRatingFloat = parseFloat(minRating);
            anding.push({ average_rating: { $gte: minRatingFloat } });
        }
        if (anding.length > 0) {
            query["$and"] = anding;
        }
        return status(200).json(query);
    }
}
module.exports = SearchController;
