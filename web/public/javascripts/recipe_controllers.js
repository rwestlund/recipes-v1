var recipe_controllers = angular.module('recipe_controllers', [])

// controller for customer listing
.controller('recipes_ctrl',
    [ '$scope', 'Recipe',
    function($scope, Recipe) {
        // populate recipe list
        $scope.recipes = Recipe.query();
        // set expand buttons to hidden
        $scope.show_help = true;
        $scope.show_advanced = true;
        // pagination defaults
        $scope.current_page = 1;
        $scope.items_per_page = 10;

        // get dynamic search display text
        $scope.get_showing_text = function() {
            return 'all recipes';
        };

    }]
)

// controller for customer details page
.controller('recipe_ctrl',
    [ '$scope', '$route', '$routeParams', '$modal', 'Model', 'Recipe',
    function($scope, $route, $routeParams, $modal, Model, Recipe) {

        // tracks whether or not a customer is modified
        $scope.is_modified = false;
        // when customer refreshed from server, prevent recipe watch
        $scope.prevent_watch = false;
        // holds whatever alert we want to show, display if msg is truthy
        $scope.alert = { type: 'warning', msg: 'You have unsaved changes' };

        // get customer info and attach callback for customer changes
        $scope.recipe =
            Recipe.findById({recipe_id: $routeParams.recipe_id},
            function() {
                // executed when customer is modified
                $scope.$watch('recipe', function(n, o) {
                    if (n === o) return;
                    // if we've just updated from server, ignore change
                    if ($scope.prevent_watch) return;
                    // change UI
                    $scope.is_modified = true;
                }, true);
            }
        );


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


        // PUT customer
        $scope.save_changes = function() {
            console.log('saving changes');
            Recipe.update($scope.recipe, function(recipe) {
                // update recipe
                $scope.recipe = recipe;
                console.log('saved');
                // clear modified flag
                $scope.is_modified = false;

                // prevent the customer watch from firing this cycle
                $scope.prevent_watch = true;
                setTimeout(function() { $scope.prevent_watch = false; },0);
            });
        };


    }]
);


