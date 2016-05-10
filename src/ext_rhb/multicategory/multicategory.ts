module itweet.category {

	export interface MultiCategoryControllerScope extends itweet.AppControllerScope {
		vm: MultiCategoryController;
	}

	export class MultiCategoryController {
		public categories: itweet.model.CategoriesQs[];
		public displayName: string = "";
		public static $inject = [
			'$scope', '$state', 'gettextCatalog', 'itweetNetwork', '$stateParams'
		];

		// dependencies are injected via AngularJS $injector
		// controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
		constructor(
			private $scope: MultiCategoryControllerScope,
			private $state,
			private gettextCatalog,
            private network: itweet.model.RHBServiceFactory,
			private $stateParams: angular.ui.IStateParamsService
			) {

            $scope.networkServiceHolder['primary'] = network.metadataService;
			$scope.vm = this;
			$scope.menu_parameters.title = gettextCatalog.getString('category_title');
			$scope.menu_parameters.icon = 'arrow_back';
			$scope.menu_parameters.navigate = undefined;

			$scope.$watch(() => { return network.metadataService.getResponseData() }, (newValue: itweet.model.MetadataResponse, oldValue) => {
				this.updateByMeta(newValue);
			});
			$scope.$watch(() => $stateParams['parentId'],() => {
				this.updateByMeta();
			})
		}

		updateByMeta(meta: itweet.model.MetadataResponse = this.network.metadataService.getResponseData()) {
			let parentId = this.$stateParams['parentId'];
			parentId = parentId == "" ? undefined:parentId;

			let mParentId = parentId;
			let append = undefined;
			while(mParentId){
				let item = meta.categoriesQs.filter((category) => category.id == mParentId)[0];
				mParentId = item.parentId;
				append = item.name + (append? " / " + append:""); 
			}			
			this.displayName = this.network.categoryService.getCategoryName() + (append? "/" + append:"");
			
			if (meta && meta.categoriesQs) {
				this.categories = meta.categoriesQs.filter((category) => category.parentId == parentId);
			}
		}

		selectCategory(category: model.CategoriesQs) {
			this.$scope.storageService.currentTweet.itemQs.refItemCategoryQsId = category.id;
			this.$scope.navigationService.next();
		}

		isCategorySelected(category: any) {
			return false;
		}

	}

	angular.module('itweet.multicategory', ['gettext', 'ui.router', 'ngMaterial'])
		.controller('MultiCategoryController', MultiCategoryController)
		.config(
			["$stateProvider", // more dependencies
				($stateProvider: angular.ui.IStateProvider) => {
					$stateProvider
						.state('app.multicategory', {
							url: "/multicategory/:parentId",
							templateUrl: "ext_rhb/multicategory/multicategory.html",
							controller: 'MultiCategoryController'
						});

				}
			]);


}