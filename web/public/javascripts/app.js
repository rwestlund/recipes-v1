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

// declare our main angular app with name and dep list
var recipes = angular.module('recipes', [
    'ngRoute',
    'ngAnimate',
    'ui.bootstrap',
    'misc_controllers',
    'admin_controllers',
    'recipe_controllers',
    'filters',
    'services',
])
// configure the angular router
.config([ '$routeProvider',
    function($routeProvider) {
        $routeProvider.
            when('/', {
                templateUrl: '/templates/index',
                controller: 'ctrl_index'
            }).
            when('/recipes', {
                templateUrl: '/templates/recipes',
                controller: 'recipes_ctrl'
            }).
            when('/recipes/:recipe_id', {
                templateUrl: '/templates/recipe',
                controller: 'recipe_ctrl',
            }).
            when('/admin/users', {
                templateUrl: '/templates/users',
                controller: 'ctrl_users'
            }).
            when('/unauthorized', {
                templateUrl: '/templates/unauthorized',
            }).
            when('/unauthorized', {
                templateUrl: '/templates/unauthorized',
            }).
            when('/404', {
                templateUrl: '/templates/404',
            }).
            otherwise({
                redirectTo: '/'
            });
    }
])
// http interceptor stuff for auth and err handling
.factory('auth_http_interceptor',
    [ '$q', '$location', '$window', '$rootScope',
    function($q, $location, $window, $rootScope) {
        return {
            // for normal responses, just look for tokens
            response: function(res) {
                console.log('http response', res.status);

                var userstring = $location.search().user;
                // if token present
                if (userstring) {
                // not a valid user
                    if (userstring == '0') {
                        alert('You are not an authorized user');
                    }
                    // valid user
                    else {
                        var user = JSON.parse(userstring);
                        console.log('we got auth!');
                        console.dir(user);
                        console.log('token:', $location.search().token);
                        // save user info
                        $window.localStorage.user_name = user.name;
                        $window.localStorage.user_role = user.role;
                        $window.localStorage.user_id = user.id;
                        $window.localStorage.user_token =
                            $location.search().token;
                        // clear url
                        $location.search('');
                        // if we have a saved location, go there
                        if ($window.localStorage.page_to_load) {
                            console.log('going to saved page', $window.localStorage.page_to_load);
                            $location.path($window.localStorage.page_to_load);
                            delete $window.localStorage.page_to_load;
                        }
                    }
                }
                // if we have a mesage from the server
                if (res.data.message) {
                    alert(res.data.message);
                }
                return res || $q.when(res);
            },
            // error responses
            responseError: function(rej) {
                // catch 401s
                if (rej.status === 401) {
                    // if there's a token there, it's old
                    delete $window.localStorage.user_name;
                    delete $window.localStorage.user_role;
                    delete $window.localStorage.user_id;
                    delete $window.localStorage.user_token;
                    console.log("can't get to", $location.path(),
                        "redirecting to login");
                    // store attempted access page here so we can return to it
                    // after login -- only store first one to prevent multiple
                    // parallel 401s from clearing this
                    if (!$window.localStorage.page_to_load)
                        $window.localStorage.page_to_load = $location.path();
                    $location.path('/login');
                }
                // show unauthorized page
                else if (rej.status === 403) {
                    $location.path('/unauthorized');
                }
                // show 404 page
                else if (rej.status === 404) {
                    $location.path('/404');
                }
                //edit conflict
                else if (rej.status === 409) {
                    $rootScope.$broadcast('edit_conflict');
                }


                // look for a message
                if (rej.data.message) {
                    $rootScope.$broadcast('http_error', rej.data);
                }
                return $q.reject(rej);
            },
            // send auth token with all requests
            request: function(config) {
                config.headers = config.headers || {};
                config.headers.Authorization =
                    $window.localStorage.user_token;
                return config;
            },
        }
    }
])
// add interceptor
.config([ '$httpProvider',
    function($httpProvider) {
        $httpProvider.interceptors.push('auth_http_interceptor');
    }
])







