module itweet.text {

	export interface TextControllerScope extends itweet.AppControllerScope{
		vm: TextController;
		inputForm: any;
	}

	export class TextController {
		public inputText: string;

		public static $inject = [
			'$scope', 'gettextCatalog', 'itweetNetwork', '$mdToast', '$mdDialog', '$log','$q'
		];

		constructor(
			private $scope: TextControllerScope,
			private gettextCatalog,
            private network: itweet.model.ServiceFactory,
            private $mdToast: angular.material.IToastService,
            private $mdDialog,
            private $log,
            private $q
		) {
			$scope.vm = this;
			$scope.menu_parameters.title = gettextCatalog.getString('message_title');
			$scope.menu_parameters.icon = 'arrow_back';
			$scope.menu_parameters.navigate = 'back';
			
			if(this.$scope.storageService.currentTweet.txt){
				this.inputText = this.$scope.storageService.currentTweet.txt;
			} else {
				this.inputText ="";
				
			}
		}

		nextClicked(text){
            //On Device Validation is not run
			if (this.$scope.inputForm.$invalid){
                this.$log.debug("Form is invalid");
                this.$scope.inputForm.text.$setTouched();
                return;
            }
			this.$scope.storageService.currentTweet.txt = text;
			this.$scope.navigationService.next();
		}
	}

	angular.module('itweet.text', ['gettext','ui.router','ngMaterial', 'ngMessages'])
            .controller('TextController', TextController)
             .config(
    ["$stateProvider", // more dependencies
        ($stateProvider:angular.ui.IStateProvider) =>
        {
        	$stateProvider
        	    .state('app.text', {
                url: "/text",
                templateUrl: "text/text.html",
                controller: 'TextController'
            });
            
        }
    ]);
}
