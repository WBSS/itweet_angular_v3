module itweet.visibility {

	export interface RhBVisibilityControllerScope extends itweet.AppControllerScope {
		vm: RhBVisibilityController;
	}

	export class RhBVisibilityController {
		public refItemVisibilities: itweet.model.RefItemVisibility[];
		public refItemVisibilityId: number;

		public static $inject = [
			'$scope', 'gettextCatalog', 'itweetNetwork', 'ItweetStorage', '$mdToast', '$mdDialog', '$log','$q'
		];

		constructor(
			private $scope: RhBVisibilityControllerScope,
			private gettextCatalog,
            private network: itweet.model.RHBServiceFactory,
			private ItweetStorage: itweet.model.StorageService,
            private $mdToast: angular.material.IToastService,
            private $mdDialog,
            private $log,
            private $q
		) {
			$scope.vm = this;
			$scope.menu_parameters.title = gettextCatalog.getString('visibility_title');
			$scope.menu_parameters.icon = 'arrow_back';
			$scope.menu_parameters.navigate = 'back';

			this.init();

			if (this.$scope.storageService.currentTweet.refItemVisibilityId) {
				this.refItemVisibilityId = this.$scope.storageService.currentTweet.refItemVisibilityId;
			} else {
				// Default
				this.refItemVisibilityId = 2; // internal
			}
		}

		init(){
			this.refItemVisibilities = [];
			var refItemVisibility = new itweet.model.RefItemVisibility();
			refItemVisibility.id = 2;
			refItemVisibility.nameTranslated = this.gettextCatalog.getString("lbl_no"); // internal
			this.refItemVisibilities.push(refItemVisibility);

			refItemVisibility = new itweet.model.RefItemVisibility();
			refItemVisibility.id = 3;
			refItemVisibility.nameTranslated = this.gettextCatalog.getString("lbl_yes"); // user group
			this.refItemVisibilities.push(refItemVisibility);
		}

		nextClicked(){
			this.$scope.storageService.currentTweet.refItemVisibilityId = this.refItemVisibilityId;
			this.$scope.navigationService.next();
		}
	}

	angular.module('itweet.rhb.visibility', ['gettext','ui.router','ngMaterial'])
            .controller('RhBVisibilityController', RhBVisibilityController)
             .config(
    ["$stateProvider", // more dependencies
        ($stateProvider:angular.ui.IStateProvider) =>
        {
        	$stateProvider
        	    .state('app.rhb_visibility', {
                url: "/visibility",
                templateUrl: "ext_rhb/visibility/visibility.html",
                controller: 'RhBVisibilityController'
            });
            
        }
    ]);;
}
