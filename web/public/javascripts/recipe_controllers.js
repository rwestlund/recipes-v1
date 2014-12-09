var recipe_controllers = angular.module('recipe_controllers', [])

// controller for recipe listing
.controller('recipes_ctrl',
    [ '$scope', '$filter', '$window', 'Recipe',
    function($scope, $filter, $window, Recipe) {

        // determine access permissions
        $scope.can_modify = ($window.localStorage.user_role === 'ADMIN'
            || $window.localStorage.user_role === 'MODERATOR'
            || $window.localStorage.user_role === 'USER');

        $scope.query;
        $scope.selected_tags = [];

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
            return $scope.selected_tags.join(', ');
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
    'Recipe', 'User',
    function($scope, $route, $routeParams, $modal, $window, Model,
    Recipe, User) {
        // determine access permissions -- more below
        $scope.can_modify = ($window.localStorage.user_role === 'ADMIN'
            || $window.localStorage.user_role === 'MODERATOR');

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

                // get author
                $scope.author = User.findById({ user_id: recipe.authorId });

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


    }]
);


