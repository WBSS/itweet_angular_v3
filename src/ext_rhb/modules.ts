/* Using Default Service Factory (awesomeFactory) */
angular.module("itweet.network", ['angular-cache', 'itweet.storage']).service("itweetNetwork", itweet.model.RHBServiceFactory)
        .config(["$httpProvider", function($httpProvider) { $httpProvider.useApplyAsync(true); }]);


/* Custom Overview HTML and Controller */
angular.module('itweet.overview', ['gettext','ui.router', 'ngMaterial'])
            .controller('OverviewController', itweet.overview.RHBOverviewController)
             .config(
    ["$stateProvider", "$urlRouterProvider", // more dependencies
        ($stateProvider, $urlRouterProvider) =>
        {
        	$stateProvider
        	    .state('app.overview', {
                url: "/overview",
                templateUrl: "ext_rhb/overview/overview.html",
                controller: 'OverviewController'//,
                //onEnter: 'OverviewController.onEnter()'
            });

        }
    ]);

angular.module('itweet.alltweets', ['gettext','ui.router','ngMaterial'])
    .controller('AlltweetsController', itweet.alltweets.RHBAlltweetsController)
    .config(
        ["$stateProvider", // more dependencies
            ($stateProvider:angular.ui.IStateProvider) =>
            {
                $stateProvider
                    .state('app.alltweets', {
                        url: "/alltweets",
                        templateUrl: "ext_rhb/alltweets/alltweets.html",
                        controller: 'AlltweetsController'
                    });
            }
        ]);