angular.module('directives', [])

.directive('ctaJobs',
    [ 'Job',
    function(Job) {
        return {
            restrict: 'E',
            templateUrl: '/templates/jobs',
            scope: {
                // if this is defined, it will change the template
                customerId: '=',
            },
            link: function(scope, element, attrs) {


                // get jobs
                scope.jobs = Job.query({ customerId: scope.customerId });

                // sort order
                scope.sort_by = 'dueDate';
                scope.reverse_sort = false;

                scope.change_sort = function(field) {
                    // if clicking on current one, toggle reverse sort
                    if (scope.sort_by === field)
                        return scope.reverse_sort = !scope.reverse_sort;
                    scope.sort_by = field;
                    scope.reverse_sort = false;
                };
                
                // set expand buttons to hidden
                scope.show_help = true;
                scope.show_advanced = true;
                // pagination defaults
                scope.current_page = 1;
                scope.items_per_page = 10;

                // completed jobs filter
                scope.completed_tristate = 1;
                // set filters
                scope.$watch('completed_tristate', function(newv, oldv) {
                    // include
                    if (!newv) scope.completed_filter = '';
                    // exclude
                    else if (newv === 1)
                        scope.completed_filter = { isComplete: false };
                    // only
                    else scope.completed_filter = { isComplete: true };
                });
                // pending jobs filter
                scope.pending_tristate = 1;
                // set filters
                scope.$watch('pending_tristate', function(newv, oldv) {
                    // include
                    if (!newv) scope.pending_filter = '';
                    // exclude
                    else if (newv === 1)
                        scope.pending_filter = { isPending: false };
                    // only
                    else scope.pending_filter = { isPending: true };
                });
                // priority jobs filter
                scope.priority_tristate = 0;
                // set filters
                scope.$watch('priority_tristate', function(newv, oldv) {
                    // include
                    if (!newv) scope.priority_filter = '';
                    // exclude
                    // not a useful state
                    //else if (newv === 1)
                        //scope.priority_filter = { isPriority: false };
                    // only
                    else scope.priority_filter = { isPriority: true };
                });

                // get the text to display under the search bar
                scope.get_showing_text = function() {
                    var text = '';
                    if (scope.completed_tristate === 1
                        && scope.pending_tristate === 1)
                        text += 'active';
                    else if (!scope.completed_tristate
                        && !scope.pending_tristate)
                        text += 'all';
                    else if (scope.completed_tristate === 2
                        && scope.pending_tristate === 2)
                        text += 'only completed pending';
                    else if(!scope.completed_tristate
                        && scope.pending_tristate === 1)
                        text += 'non pending';
                    else if(!scope.completed_tristate
                        && scope.pending_tristate === 2)
                        text += 'only pending';
                    else if(scope.completed_tristate === 1
                        && scope.pending_tristate === 0)
                        text += 'incomplete';
                    else if(scope.completed_tristate === 1
                        && scope.pending_tristate === 2)
                        text += 'current pending';
                    else if(scope.completed_tristate === 2
                        && scope.pending_tristate === 0)
                        text += 'completed';
                    else if(scope.completed_tristate === 2
                        && scope.pending_tristate === 1)
                        text += 'completed non pending';
                    if (scope.priority_tristate) text += ' priority';
                    return text + ' jobs';
                };


                // return true if arg is earlier than now
                scope.is_overdue = function(date) {
                    return new Date(date) < new Date();  
                };
                scope.due_this_week = function(date) {
                    var q = new Date(date);
                    var lim = new Date();
                    lim.setDate(lim.getDate() + 7);
                    return q > new Date() && q < lim;
                };

                // get class of job row
                scope.job_class = function(job) {
                    return {
                        'active': job.__expanded,
                        'bg-muted': job.isComplete,
                        'bg-danger': scope.is_overdue(job.dueDate) && !job.isComplete,
                        'bg-warning': scope.due_this_week(job.dueDate) && !job.isComplete,
                        'bg-success': !scope.due_this_week(job.dueDate) && !scope.is_overdue(job.dueDate) && !job.isComplete,
                    };
                };


                // TODO find a better way to access this from directive (copied there now)
                scope.get_awning_string = function(type) {
                    if (type == undefined) return undefined;
                    switch(type) {
                        case 'CanvasAwning': return 'Canvas awning';
                        case 'Recover': return 'Recover';
                        case 'Repair': return 'Repair';
                        case 'PatioCanopy': return 'Patio canopy';
                        case 'MiscCanvasProducts': return 'Misc canvas products';
                        case 'CanvasCurtains': return 'Canvas curtains/enclosures';
                        case 'Retractable': return 'Retractable awning';
                        case 'Screen': return 'Screen';
                        case 'BallewsCanopy': return "Ballew's canopy";
                        case 'EliteDeckCanopy': return 'Elite-Deck canopy';
                        case 'StandingSeam': return 'Standing seam';
                        case 'BahamaShutters': return 'Bahama shutters';
                        case 'SunControlLouvers': return 'Sun control louvers';
                        case 'MiscMetalProducts': return 'Misc metal products';
                        case 'Labor': return 'Labor';
                        default:
                            console.error('unknown awning type', type);
                            return 'unknown awning type';
                    }
                };


            },

        };
    }
]);
