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

var misc_controllers = angular.module('misc_controllers', [])

// top level parent controller
.controller('master_ctrl',
    [ '$scope', '$window', '$location', '$route', '$http', '$modal', 'Recipe',
    function($scope, $window, $location, $route, $http, $modal, Recipe) {

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
                function(data) { console.log('modal canceled:', data); }
            );
         });

        // referenced by the admin page
        $scope.user_roles = [ 'ADMIN', 'MODERATOR', 'USER', 'GUEST' ];

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
                delete $window.localStorage.user_id;
                delete $window.localStorage.user_token;
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



