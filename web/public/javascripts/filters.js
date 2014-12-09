var filters = angular.module('filters', [])

.filter('checkmark', function() {
    return function(input) { 
        return input ? '\u2713' : '\u2718';
    }
})
// return a subset of an array
.filter('startFrom', function() {
    return function(input, start) {
        if (!input) return;
        return input.slice(+start);
    }
})

// only return elements with a tag array containing all the tags in tags
.filter('hasTags', function() {
    return function(array, tags) {
        if (!tags) return array;
        var filtered = [];
        array.forEach(function(item) {
            var skip;
            tags.forEach(function(tag) {
                if (item.tags.indexOf(tag) === -1) skip = true;
            });
            if (!skip) filtered.push(item);
        });
        return filtered;
    }
})

