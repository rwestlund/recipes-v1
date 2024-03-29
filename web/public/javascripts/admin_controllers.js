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

var admin_controllers = angular.module('admin_controllers', [])

// top level parent controller
.controller('ctrl_users',
    [ '$scope', '$route', '$modal', 'User', 'Model',
    function($scope, $route, $modal, User, Model) {

        // true when unsaved changes
        $scope.is_modified = false;
        $scope.prevent_watch = false;

        // get user listing
        $scope.users = User.query({}, function() {
            // executed when customer is modified
            $scope.$watch('users', function(new_user, old_user) {
                if (new_user === old_user) return;
                if ($scope.prevent_watch) return;
                console.log('user modified');
                $scope.is_modified = true;
            }, true);
        });

        // var for a new user
        $scope.new_user = Model.query({ model: 'user' });

        $scope.save_changes = function() {
            User.update($scope.users, function(data) {
                console.log('update successful');
                $scope.users = data;
                // clear modified flag
                $scope.is_modified = false;
                // prevent watch from seeing this change
                $scope.prevent_watch = true;
                setTimeout(function() { $scope.prevent_watch = false; }, 0);
            });
        };

        $scope.add_user = function() {
            User.create($scope.new_user, function(user) {
                console.log('created new user');
                // replace user struct (for a new id)
                $scope.new_user = Model.query({ model: 'user' });
                // add to UI
                $scope.users.push(user);
                // prevent watch from seeing this change
                $scope.prevent_watch = true;
                setTimeout(function() { $scope.prevent_watch = false; }, 0);
            });
        };

        // called by delete user button
        $scope.open_delete_user_modal = function(user) {
            var modal_instance = $modal.open({
                templateUrl: '/templates/modal',
                controller: 'modal_ctrl',
                size: 'sm',
                // pass vars
                resolve: {
                    type: function() { return 'prompt'; },
                    text: function() {
                        return 'Are you sure you want to delete '
                            + user.role + ' ' + user.email + '?';
                    },
                    title: function() { return 'Confirm Delete User'; },
                    items: function() { return null; },
                },
            });

            modal_instance.result.then(
                // called on ok
                function(data) {
                    console.log('modal resolved:', data);
                    $scope.delete_user(user.id)
                },
                // called on cancel
                function(data) {
                    console.log('modal cancelled:', data)
                }
            );
        };

        $scope.delete_user = function(id) {
            console.log('deleting user', id);
            User.delete({ user_id: id }, function(data) {
                console.log('delete successful');

                // remove from UI
                $scope.users = $scope.users.filter(function(user) {
                    return user.id != id;
                });
                // prevent watch from seeing this change
                $scope.prevent_watch = true;
                setTimeout(function() { $scope.prevent_watch = false; }, 0);
            });
        };


    }
])
