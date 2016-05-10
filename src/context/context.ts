module itweet.context {

	export interface ContextControllerScope extends itweet.AppControllerScope{
		vm: ContextController;
	}
	export class ContextController {

		public static $inject = [
			'$scope', '$state', 'gettextCatalog', 'itweetNetwork', '$log'
		];
		private loaded: any = {};

		// dependencies are injected via AngularJS $injector
		// controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
		constructor(
			private $scope: ContextControllerScope,
			private $state,
			private gettextCatalog,
            private network: itweet.model.ServiceFactory,
			private $log
		) {
            $scope.networkServiceHolder['primary'] = network.contextService;
			$scope.vm = this;
			$scope.menu_parameters.title = gettextCatalog.getString('context_title');
			$scope.menu_parameters.icon = 'arrow_back';
			$scope.menu_parameters.navigate = undefined;
			if(!this.updateFromData()){
					network.contextService.run().then(() => {
						this.updateFromData();
					});
			}
			
			
			
		}
		updateFromData(){
			var data = this.network.contextService.getResponseData();
				if(data && data.length == 1){
					var context = data[0];
					this.$scope.storageService.currentTweet.contextToken = context.contextToken;
					this.$scope.navigationService.next(true);
					return true;
				}
			return false;
		}


		setLoad(context){
			this.loaded[context.contextToken] = true;
		}
		isLoaded(context){
			return this.loaded[context.contextToken];
		}

		contextSelected(context: any){
			this.$log.debug("Selecting Context: "+context.contextToken);
			this.$scope.storageService.currentTweet.contextToken = context.contextToken;
			this.$scope.navigationService.next();
		}

		isContextSelected(context: any){
			return false;
		}

	}

	angular.module('itweet.context', ['gettext','ui.router', 'ngMaterial','ngOnload'])
            .controller('ContextController', ContextController)
             .config(
    ["$stateProvider", // more dependencies
        ($stateProvider:angular.ui.IStateProvider) =>
        {
        	$stateProvider
        	    .state('app.context', {
                url: "/context",
                templateUrl: "context/context.html",
                controller: 'ContextController'
            });
            
        }
    ]);;


}
