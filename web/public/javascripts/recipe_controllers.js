var recipe_controllers = angular.module('recipe_controllers', [])

// controller for recipe listing
.controller('recipes_ctrl',
    [ '$scope', '$filter', '$window', 'Recipe',
    function($scope, $filter, $window, Recipe) {

        // determine access permissions
        $scope.can_modify = ($window.localStorage.user_role === 'ADMIN'
            || $window.localStorage.user_role === 'MODERATOR'
            || $window.localStorage.user_role === 'USER');

        // search string
        $scope.query;
        // active search tags
        $scope.selected_tags = [];
        // active exclude tags
        $scope.deselected_tags = [];
        // possible exclude tags, depends on what's active
        $scope.deselect_tag_list = [];

        // whenever primary tag selection changes, clear exclude tags
        $scope.$watchCollection('selected_tags', function(n, o) {
            // if nothing to change, leave
            if (!$scope.deselected_tags.length) return;
            // this will change the search results which are being calculated
            // in parallel, so manually fire digest again
            $scope.deselected_tags = [];
            $scope.$apply();
        });

        // when selected_tags changes, list only the tags that are used in
        // search results, but not in selected tags
        $scope.$watchCollection('filtered_recipes', function(n, o) {
            $scope.deselect_tag_list = angular.copy($scope.deselected_tags);
            if (!n) return;
            $scope.filtered_recipes.forEach(function(recipe) {
                recipe.tags.forEach(function(tag) {
                    if ($scope.selected_tags.indexOf(tag) === -1
                        && $scope.deselect_tag_list.indexOf(tag) === -1)
                        $scope.deselect_tag_list.push(tag);
                });
            });
            $scope.deselect_tag_list.sort();
        });

        // populate recipe list
        $scope.recipes = Recipe.query(function(recipes) {
            // build list of all tags
            $scope.tags = [];
            recipes.forEach(function(recipe) {
                recipe.tags.forEach(function(tag) {
                    if ($scope.tags.indexOf(tag) === -1)
                        $scope.tags.push(tag);
                });
            });
            $scope.tags.sort();
        });
        // set expand buttons to hidden
        $scope.show_help = true;
        $scope.show_advanced = true;
        // pagination defaults
        $scope.current_page = 1;
        $scope.items_per_page = 10;

        // get dynamic search display text
        $scope.get_showing_text = function() {
            if (!$scope.selected_tags.length) return 'all recipes';
            var text = $scope.selected_tags.join(', ');
            if (!$scope.deselected_tags.length) return text;
            return text + ', except ' + $scope.deselected_tags.join(', ');
        };
        
        // get recipe name from id
        $scope.get_recipe_name = function(id) {
            if (!id || !$scope.recipes.$resolved) return;
            return $scope.recipes.filter(function(recipe) {
                return recipe.id === id;
            })[0].title;
        }

        $scope.get_tags = function(recipe) {
            if (!recipe.tags.length) return '';
            var text = '';
            recipe.tags.forEach(function(tag) {
                text += tag + ', ';
            });
            return text.slice(0,text.length-2);
        };

    }]
)

// controller for recipe details page
.controller('recipe_ctrl',
    [ '$scope', '$route', '$routeParams', '$modal', '$window', 'Model',
    'Recipe', 'User', 'Comment',
    function($scope, $route, $routeParams, $modal, $window, Model,
    Recipe, User, Comment) {
        // determine access permissions -- more below
        $scope.can_modify = ($window.localStorage.user_role === 'ADMIN'
            || $window.localStorage.user_role === 'MODERATOR');

        // whether the user can post comments
        $scope.can_comment = ($window.localStorage.user_role === 'ADMIN'
            || $window.localStorage.user_role === 'MODERATOR'
            || $window.localStorage.user_role === 'USER');

        // tracks whether or not a recipe is modified
        $scope.is_modified = false;
        // when recipe refreshed from server, prevent recipe watch
        $scope.prevent_watch = false;
        // holds whatever alert we want to show, display if msg is truthy
        $scope.alert = { type: 'warning', msg: 'You have unsaved changes' };

        // get recipe info and attach callback for recipe changes
        $scope.recipe =
            Recipe.findById({recipe_id: $routeParams.recipe_id},
            function(recipe) {
                // if the user owns this recipe
                if ($window.localStorage.user_id === recipe.authorId)
                    $scope.can_modify = true;

                // if no title, automatically go to edit mode
                if (!recipe.title && $scope.can_modify)
                    $scope.edit_mode = true;

                // get author
                $scope.author = User.findById({ user_id: recipe.authorId });

                // sort directions
                $scope.move_up = function(index) {
                    if(!index || !$scope.recipe.directions.length) return;
                    var temp = $scope.recipe.directions[index];
                    $scope.recipe.directions[index] =
                        $scope.recipe.directions[index - 1];
                    $scope.recipe.directions[index - 1] = temp;
                };

                // sort ingredients
                $scope.move_ingredient_up = function(index) {
                    if(!index || !$scope.recipe.ingredients.length) return;
                    var temp = $scope.recipe.ingredients[index];
                    $scope.recipe.ingredients[index] =
                        $scope.recipe.ingredients[index - 1];
                    $scope.recipe.ingredients[index - 1] = temp;
                };


                // executed when recipe is modified
                $scope.$watch('recipe', function(n, o) {
                    if (n === o) return;
                    // if we've just updated from server, ignore change
                    if ($scope.prevent_watch) return;
                    // change UI
                    $scope.is_modified = true;
                }, true);
            }
        );

        // get all recipes
        $scope.recipes = Recipe.query(function(recipes) {
            // build list of all tags
            $scope.tags = [];
            recipes.forEach(function(recipe) {
                recipe.tags.forEach(function(tag) {
                    if ($scope.tags.indexOf(tag) === -1)
                        $scope.tags.push(tag);
                });
            });
            $scope.tags.sort();

        });
        // callback for when a new recipe is linked
        $scope.linked_recipe_select = function(item, model, label) {
            // add it to list
            $scope.recipe.linked.push(item.id);
            $scope.linked_recipe = null;
        };

        // get recipe name from id
        $scope.get_recipe_name = function(id) {
            if (!id || !$scope.recipes.$resolved) return;
            return $scope.recipes.filter(function(recipe) {
                return recipe.id === id;
            })[0].title;
        }


        $scope.delete_recipe = function() {
            console.log('deleting recipe');
            Recipe.delete({ recipe_id: $scope.recipe.id }, 
                function(data) {
                    console.log('successfully deleted');
                    $scope.go('/recipes');
                }
            );
        };

        // called by delete button
        $scope.open_delete_modal = function() {
            var modal_instance = $modal.open({
                templateUrl: '/templates/modal',
                controller: 'modal_ctrl',
                size: 'sm',
                // pass vars
                resolve: {
                    type: function() { return 'prompt'; },
                    text: function() {
                        return 'Are you sure you want to delete this recipe?';
                    },
                    title: function() { return 'Confirm Delete Recipe'; },
                    items: function() { return null; },
                },
            });

            modal_instance.result.then(
                // called on ok
                function(data) {
                    console.log('modal resolved:', data);
                    $scope.delete_recipe();
                },
                // called on cancel
                function(data) {
                    console.log('modal cancelled:', data)
                }
            );
        };


        // PUT recipe
        $scope.save_changes = function() {
            console.log('saving changes');
            Recipe.update($scope.recipe, function(recipe) {
                // update recipe
                $scope.recipe = recipe;
                console.log('saved');
                // clear modified flag
                $scope.is_modified = false;

                // prevent the recipe watch from firing this cycle
                $scope.prevent_watch = true;
                setTimeout(function() { $scope.prevent_watch = false; },0);
            });
        };

        // model for new comment
        $scope.new_comment = { text: '' };
        // dictionary of users we need to fetch for comments
        $scope.users = {};
        // get all comments for this recipe
        refresh_comments = function() {
            $scope.comments = Comment.query({recipe_id: $routeParams.recipe_id},
                function(comments) {
                    // clear this so we can refresh
                    $scope.new_comment = { text: '' };
                    // for first occurance of each comment, fetch user
                    comments.forEach(function(comment) {
                        if ($scope.users[comment.authorId]) return;
                        $scope.users[comment.authorId] =
                            User.findById({ user_id: comment.authorId });
                    });
                }
            );
        };
        refresh_comments();
        
        // POST a new comment and refresh
        $scope.add_comment = function() {
            if (!$scope.new_comment.text) return;
            Comment.create({ recipe_id: $scope.recipe.id },
                $scope.new_comment, function(comment) {
                    refresh_comments()
                }
            );
        };
        // delete then refresh
        $scope.delete_comment = function(id) {
            Comment.delete({recipe_id: $routeParams.recipe_id, comment_id: id},
                function() {
                    refresh_comments();
                }
            );
        };
        // edit comment
        $scope.update_comment = function(comment) {
            Comment.update({ recipe_id: $routeParams.recipe_id }, comment,
                function(new_comment) {
                    refresh_comments();
                }
            );
        };
            

        // called by delete button
        $scope.open_delete_comment_modal = function(id) {
            var modal_instance = $modal.open({
                templateUrl: '/templates/modal',
                controller: 'modal_ctrl',
                size: 'sm',
                // pass vars
                resolve: {
                    type: function() { return 'prompt'; },
                    text: function() {
                        return 'Are you sure you want to delete this comment?';
                    },
                    title: function() { return 'Confirm Delete Comment'; },
                    items: function() { return null; },
                },
            });
            modal_instance.result.then(
                // called on ok
                function(data) {
                    console.log('modal resolved:', data);
                    $scope.delete_comment(id);
                },
                // called on cancel
                function(data) {
                    console.log('modal cancelled:', data)
                }
            );
        };

        // true if the user can edit this person's posts
        $scope.user_is = function(id) {
            return $window.localStorage.user_id === id
                || $window.localStorage.user_role === 'MODERATOR'
                || $window.localStorage.user_role === 'ADMIN';
        };

    }]
);


