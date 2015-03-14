/*
Copyright (c) 2015, Randy Westlund.  All rights reserved.

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

var services = angular.module('services', [ 'ngResource' ])

// we'll call this whenever we want to retrieve json resources
.factory('Recipe', [ '$resource',
    function($resource) {
        return $resource('/recipes/:recipe_id', {}, {
            query: { method: 'GET', isArray: true },
            findById: { method: 'GET' },
            update: { method: 'PUT', params: { recipe_id: '@id' }},
            delete: { method: 'DELETE' },
            create: { method: 'POST' }
        });
    }
])
.factory('Comment', [ '$resource',
    function($resource) {
        return $resource('/comments/:recipe_id/:comment_id', {}, {
            query: { method: 'GET', isArray: true },
            update: { method: 'PUT', params: { comment_id: '@id' }},
            delete: { method: 'DELETE' },
            create: { method: 'POST' }
        });
    }
])
.factory('User', [ '$resource',
    function($resource) {
        return $resource('/users/:user_id', {}, {
            query: { method: 'GET', isArray: true },
            findById: { method: 'GET' },
            update: { method: 'PUT', isArray: true },
            delete: { method: 'DELETE' },
            create: { method: 'POST' }
        });
    }
])
.factory('Model', [ '$resource',
    function($resource) {
        return $resource('/models/:model', {}, {
            query: { method: 'GET' },
         });
    }
])
