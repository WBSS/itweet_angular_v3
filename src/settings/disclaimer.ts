module itweet.disclaimer {

	export class DislaimerController {
        public static $inject = ['$scope', 'gettextCatalog'];
        constructor(private $scope:AppControllerScope,
                    private gettextCatalog){
                
            $scope.menu_parameters.title = gettextCatalog.getString('disclaimer_title');
			$scope.menu_parameters.icon = 'arrow_back';
			$scope.menu_parameters.navigate = 'back';
            
        }
	}

	angular.module('itweet.disclaimer', ['gettext','ui.router','ngMaterial'])
            .controller('DislaimerController', DislaimerController)
             .config(
    ["$stateProvider", // more dependencies
        ($stateProvider:angular.ui.IStateProvider) =>
        {
        	$stateProvider
        	    .state('app.disclaimer', {
                url: "/disclaimer",
                templateUrl: "settings/disclaimer.html",
                controller: 'DislaimerController'
            });
        }
    ]);

}