module itweet {

	/**
	 * The main controller for the app. The controller:
	 * - retrieves and persists the model via the todoStorage service
	 * - exposes the model to the template and provides event handlers
	 */
	export interface AppControllerScope extends angular.IScope {
		mvm: AppController;
		menu_parameters: any;
		navigationService: itweet.navigation.NavigationService;
		storageService: itweet.model.StorageService;
		networkServiceHolder: { [id: string]: itweet.ILoadingItem };
		brand: itweet.model.BasicService<any>;
		subheaderStyle: string;
		footerStyle: string;
		startWatchGeoPosition: any;
	}

	export class AppController {
		public static $inject = [
			'$scope', '$state', 'ItweetStorage', 'ItweetNavigation', '$log', 'itweetNetwork'
		];

		constructor(
			private $scope: AppControllerScope,
			private $state,
            private ItweetStorage: itweet.model.StorageService,
            private ItweetNavigation: itweet.navigation.NavigationService,
			private $log: ng.ILogService,
			public iTweetNetwork: itweet.model.ServiceFactory
			) {
			$scope.mvm = this;
			$scope.menu_parameters = { 'icon': 'arrow-back', 'title': 'Teststuff', 'navigate': 'app.context' };
			$scope.storageService = ItweetStorage;
			$scope.navigationService = ItweetNavigation;
			$scope.brand = iTweetNetwork.brandService;

			$scope.networkServiceHolder = {};

			$scope.$watch(() => { return iTweetNetwork.brandService.getSubheaderStyle() }, (data) => {
				$scope.subheaderStyle = data
			})
			$scope.$watch(() => { return iTweetNetwork.brandService.getFooterStyle() }, (data) => {
				$scope.footerStyle = data
			})
		}
	}

	angular.module('itweet.app', ['gettext', 'ui.router', 'ngMaterial', 'ngMdIcons'])
		.controller('AppController', AppController)
		.config(
			["$stateProvider", "$urlRouterProvider", // more dependencies
				($stateProvider, $urlRouterProvider) => {
					$stateProvider
						.state('app', {
							url: "/app",
							templateUrl: "app/app.html",
							controller: 'AppController'
						});

				}
			])
}
