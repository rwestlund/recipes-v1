var services = angular.module('services', [ 'ngResource' ])

// we'll call this whenever we want to retrieve customers
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
.factory('User', [ '$resource',
    function($resource) {
        return $resource('/users/:user_id', {}, {
            query: { method: 'GET', isArray: true },
            update: { method: 'PUT', isArray: true },
            delete: { method: 'DELETE' },
            create: { method: 'POST' }
        });
    }
])
// pair to the one below, info for display
// types = 'jobs' or 'appointments'
.factory('FileInfo', [ '$resource',
    function($resource) {
        return $resource('/:types/:id/fileinfo', {}, {
            query: { method: 'GET', isArray: true },
            update: { method: 'PUT', isArray: true },
        });
    }
])
// access to these will be via direct link
// type = 'job' or 'appointment'
.factory('File', [ '$resource',
    function($resource) {
        return $resource('/files/:type/:file_id', {}, {
            delete: { method: 'DELETE' },
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
