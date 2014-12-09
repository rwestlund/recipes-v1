// declare our main angular app with name and dep list
var recipes = angular.module('recipes', [
    'ngRoute',
    'ngAnimate',
    'ui.bootstrap',
    'angularFileUpload',
    'ipCookie',
    'misc_controllers',
    'admin_controllers',
    'recipe_controllers',
    'filters',
    'services',
    'directives',
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
    [ '$q', '$location', '$window', '$rootScope', 'ipCookie',
    function($q, $location, $window, $rootScope, ipCookie) {
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
                        // put token in cookie for file requests
                        ipCookie('authorization', $location.search().token, 
                            { expires: 365, secure: true });
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
                    ipCookie.remove('authorization');
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







