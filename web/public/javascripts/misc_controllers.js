var misc_controllers = angular.module('misc_controllers', [])

// top level parent controller
.controller('master_ctrl',
    [ '$scope', '$window', '$location', '$route', '$http', '$modal',
    'ipCookie', 'Recipe',
    function($scope, $window, $location, $route, $http, $modal,
    ipCookie, Recipe) {

        // if localstorage is empty, clear the cookie too
        if (!$window.localStorage.user_token) ipCookie.remove('authorization');

        // make location and window available
        // TODO get these out of here
        $scope.location = $location;
        $scope.window = $window;
        $scope.route = $route;

        // events
        $scope.$on('http_error', function(event, data) {
            console.dir(data);
            var modal_instance = $modal.open({
                templateUrl: '/templates/modal',
                controller: 'modal_ctrl',
                size: 'sm',
                // pass vars
                resolve: {
                    type: function() { return 'error'; },
                    text: function() { return data.message; },
                    title: function() { return 'Error'; },
                    items: function() { return data.items; },
                },
            });
            modal_instance.result.then(
                // called on ok
                function(data) { console.log('modal resolved:', data); },
                // called on cancel
                function(data) { console.log('modal cancelled:', data); }
            );
         });

        $scope.$on('edit_conflict', function(event) {
            var modal_instance = $modal.open({
                templateUrl: '/templates/modal',
                controller: 'modal_ctrl',
                size: 'sm',
                // pass vars
                resolve: {
                    type: function() { return 'error'; },
                    text: function() { return "You're trying to save an outdated version of a record -- it was likely was just modified by someone else.  To protect the integrity of the database, you're changes have NOT been saved.  Please refresh the page to retreive the updated record, then try your edits again."; },
                    title: function() { return 'Edit Conflict'; },
                    items: function() { return null; },
                },
            });
            modal_instance.result.then(
                // called on ok
                function(data) { console.log('modal resolved:', data); },
                // called on cancel
                function(data) { console.log('modal cancelled:', data); }
            );
         });

        // follow external link in new window
        $scope.navigate = function(dest) {
            $window.open(dest);
        };
        
        // refresh page
        $scope.refresh = function() {
            $route.reload();
        };

        // go to internal link
        $scope.go = function(path) {
            // if we're already there, we have to reload the route to refresh
            if ($location.path() === path) $route.reload();
            // else just change the URL
            else $location.path(path);
        };

        // external function to pretty print file size
        $scope.filesize = function(num) {
            return $window.filesize(num);
        };

        $scope.create_recipe = function() {
            Recipe.create(
                function(recipe) {
                    console.log('created recipe, redirecting...');
                    $scope.go('/recipes/' + recipe.id);
                }
            );
        };
 
        $scope.logout = function() {
            $http.delete('/tokens').then(function(data) {
                delete $window.localStorage.user_name;
                delete $window.localStorage.user_role;
                delete $window.localStorage.user_token;
                ipCookie.remove('authorization');
                $scope.go('/');
            });
        }

    }
])
// home page
.controller('ctrl_index',
    [ '$scope',
    function($scope) {
    }
])
// represents instances of modal
.controller('modal_ctrl',
    [ '$scope', '$modalInstance', 'text', 'title', 'type', 'items',
    function($scope, $modalInstance, text, title, type, items) {
        // set passed vars
        $scope.text = text;
        $scope.title = title;
        // error or prompt
        $scope.type = type;
        // list to display
        $scope.items = items;

        $scope.ok = function() {
            $modalInstance.close('accepted');
        };
        $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
        };
    }
])



