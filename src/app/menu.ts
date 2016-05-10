module itweet {

	/**
	 * The main controller for the app. The controller:
	 * - retrieves and persists the model via the todoStorage service
	 * - exposes the model to the template and provides event handlers
	 */
	export interface MenuControllerScope extends AppControllerScope{
		menuController: MenuController;
	}
	export class MenuController {


		// $inject annotation.
		// It provides $injector with information about dependencies to be injected into constructor
		// it is better to have it close to the constructor, because the parameters must match in count and type.
		// See http://docs.angularjs.org/guide/di
		public static $inject = [
			'$scope', '$state', 'ItweetStorage', 'ItweetNavigation', '$log','itweetNetwork'
		];

		// dependencies are injected via AngularJS $injector
		// controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
		constructor(
			private $scope: MenuControllerScope,
			private $state,
            private ItweetStorage: itweet.model.StorageService,
            private ItweetNavigation: itweet.navigation.NavigationService,
			private $log: ng.ILogService,
			public iTweetNetwork: itweet.model.ServiceFactory
		) {
			$scope.menuController = this;
			$scope.$on('$stateChangeSuccess', (event, toState, toParams, fromState, fromParams) => { 
			this.updateMenu();
			});
			this.updateMenu();
			}
		updateMenu(){
			if(this.$scope.navigationService.shouldShowNoNavigationButtons()){
				this.$scope.menu_parameters.icon = undefined;
				this.$scope.menu_parameters.navigate = undefined;
			}else{
				if(this.$scope.navigationService.shouldDisplayBackbutton()){
					this.$scope.menu_parameters.icon = 'arrow_back';
					this.$scope.menu_parameters.navigate = undefined;
				} else {
					this.$scope.menu_parameters.icon = 'person_outline';
					this.$scope.menu_parameters.navigate = 'app.settings';
				}
			}
			this.$log.info("update menu to " +this.$scope.menu_parameters.icon );
		}

		storeVisible(){
			//return this.ItweetNavigation.isCurrentStateOverview() && this.ItweetStorage.hasTweetsSaved();
			return this.ItweetStorage.hasTweetsSaved() && !this.$scope.navigationService.shouldShowNoNavigationButtons();
		}
		storeClicked(){
			this.$scope.navigationService.go(new itweet.navigation.State('app.mytweets'));
		}
		menuClicked(){
			this.$log.debug("MenuButton: "+this.$scope.menu_parameters.navigate);
			if(this.$scope.menu_parameters.navigate == undefined || this.$scope.menu_parameters.navigate == 'back'){
				this.$log.debug("NavigationService.back");
				this.$scope.navigationService.previous();
			}else if(this.$scope.menu_parameters.navigate == 'none') {
				
			} else {
				//this.$state.go(this.$scope.menu_parameters.navigate);
				this.$scope.navigationService.go(new itweet.navigation.State(this.$scope.menu_parameters.navigate));
			}
		}
	}

	angular.module('itweet.menu', ['gettext','ui.router','ngMaterial', 'ngMdIcons'])
            .controller('MenuController', MenuController);
}
