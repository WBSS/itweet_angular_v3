module itweet.help {

    export interface HelpControllerScope extends itweet.AppControllerScope{
		HelpUrl: string;
	}

	export class HelpController {
        public static $inject = ['$scope', 'gettextCatalog', 'ItweetConfig','$sce'
		];
        constructor(
            private $scope:HelpControllerScope,
            private gettextCatalog,
			private ItweetConfig,
            private $sce:ng.ISCEService){
                
            $scope.HelpUrl = $sce.trustAsResourceUrl(ItweetConfig.HelpUrl());
            $scope.menu_parameters.title = gettextCatalog.getString('help_title');
			$scope.menu_parameters.icon = 'arrow_back';
			$scope.menu_parameters.navigate = 'back';
            
        }
	}

	angular.module('itweet.help', ['gettext','ui.router','ngMaterial'])
            .controller('HelpController', HelpController)
             .config(
    ["$stateProvider", // more dependencies
        ($stateProvider:angular.ui.IStateProvider) =>
        {
        	$stateProvider
        	    .state('app.help', {
                url: "/help",
                templateUrl: "settings/help.html",
                controller: 'HelpController'
            });
        }
    ]);

}