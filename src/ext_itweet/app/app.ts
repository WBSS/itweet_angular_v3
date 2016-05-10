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


		// $inject annotation.
		// It provides $injector with information about dependencies to be injected into constructor
		// it is better to have it close to the constructor, because the parameters must match in count and type.
		// See http://docs.angularjs.org/guide/di
		public static $inject = [
			'$scope', '$state', 'ItweetStorage', 'ItweetNavigation', '$log', 'itweetNetwork'
		];

		// dependencies are injected via AngularJS $injector
		// controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
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

			//watch geo position
			$scope.startWatchGeoPosition();

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
		.run(function($rootScope, $cordovaGeolocation) {
				$rootScope.startWatchGeoPosition = function() {

					var watchOptions = {
					 timeout : 30000,
					 enableHighAccuracy: true // may cause errors if true
					 };
					 var watch = $cordovaGeolocation.watchPosition(watchOptions);
					 watch.then(
					 null,
					 function(err) {
						 console.log('geo position: error: ' + err.message);
						 $rootScope.errorGeoLocation = err.message;

					 },
					 function(position) {
					 $rootScope.position = position
					 });
					 console.log('geo position: start watch');
				}


				});

}
