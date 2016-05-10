module itweet.category {

	export interface CategoryControllerScope extends itweet.AppControllerScope{
		vm: CategoryController;
	}

	export class CategoryController {

		public static $inject = [
			'$scope', '$state', 'gettextCatalog', 'itweetNetwork'
		];

		// dependencies are injected via AngularJS $injector
		// controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
		constructor(
			private $scope: CategoryControllerScope,
			private $state,
			private gettextCatalog,
            private network: itweet.model.ServiceFactory
		) {
            $scope.networkServiceHolder['primary'] = network.categoryService;
			$scope.vm = this;
			$scope.menu_parameters.title = gettextCatalog.getString('category_title');
			/*$scope.menu_parameters.icon = undefined
			$scope.menu_parameters.navigate = undefined;*/
			
			/* RHB FIX: FIXME REFACTOR */
			$scope.$watch(() => {return network.contextService.getResponseData()}, (data) => {
				if(data && data.length == 1){
					var context = data[0];
					this.$scope.storageService.currentTweet.contextToken = context.contextToken;
				}
			})
			
		}

		selectCategory(category: any){
			this.$scope.storageService.currentTweet.refItemCategoryId = category.id;
			this.$scope.navigationService.next();
		}

		isCategorySelected(category: any){
			return false;
		}

	}

	angular.module('itweet.category', ['gettext','ui.router','ngMaterial'])
            .controller('CategoryController', CategoryController)
             .config(
    ["$stateProvider", // more dependencies
        ($stateProvider:angular.ui.IStateProvider) =>
        {
        	$stateProvider
        	    .state('app.category', {
                url: "/category",
                templateUrl: "category/category.html",
                controller: 'CategoryController'
            });
            
        }
    ]);;


}
