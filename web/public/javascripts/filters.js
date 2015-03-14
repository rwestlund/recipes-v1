/*
Copyright (c) 2016, Randy Westlund.  All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
this list of conditions and the following disclaimer in the documentation
and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

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

// only return elements with a tag array containing all the tags in tags and
// none of the exclude tags
.filter('hasTags', function() {
    return function(array, include_tags, exclude_tags) {
        if (!(include_tags || exclude_tags)) return array;
        var filtered = [];
        array.forEach(function(item) {
            var skip;
            include_tags.forEach(function(tag) {
                if (item.tags.indexOf(tag) === -1) skip = true;
            });
            exclude_tags.forEach(function(tag) {
                if (item.tags.indexOf(tag) !== -1) skip = true;
            });
            if (!skip) filtered.push(item);
        });
        return filtered;
    }
})

