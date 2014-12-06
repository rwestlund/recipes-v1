var filters = angular.module('filters', [])

.filter('checkmark', function() {
    return function(input) { 
        return input ? '\u2713' : '\u2718';
    }
})
// return a subset of an array
.filter('startFrom', function() {
    return function(input, start) {
        return input.slice(+start);
    }
})
