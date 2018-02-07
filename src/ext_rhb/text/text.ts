module itweet.text {

	export interface TextControllerScope extends itweet.AppControllerScope{
		vm: TextController;
		inputForm: any;
	}

	export class TextController {
		public inputText: string;
		public stateName: string;
		public inputMaxLength: number = 222;

		public static $inject = [
			'$scope', 'gettextCatalog', 'itweetNetwork', '$mdToast', '$mdDialog', '$log', '$q', '$state'
		];

		constructor(
			private $scope: TextControllerScope,
			private gettextCatalog,
            private network: itweet.model.ServiceFactory,
            private $mdToast: angular.material.IToastService,
            private $mdDialog,
            private $log,
            private $q,
			private $state: angular.ui.IStateService
		) {
			$scope.vm = this;
			$scope.menu_parameters.title = gettextCatalog.getString('message_title');
			$scope.menu_parameters.icon = 'arrow_back';
			$scope.menu_parameters.navigate = 'back';

			this.stateName = this.$state.current.name;
			this.inputText = "";

			if (this.stateName === "app.text") {
				this.inputMaxLength = 1000;
				if (this.$scope.storageService.currentTweet.txt){
					this.inputText = this.$scope.storageService.currentTweet.txt;
				}
			} else if (this.stateName === "app.text_idea_what") {
				this.inputMaxLength = 1000;
				if (this.$scope.storageService.currentTweet.textIdeaWhat){
					this.inputText = this.$scope.storageService.currentTweet.textIdeaWhat;
				}
			} else if (this.stateName === "app.text_idea_who") {
				this.inputMaxLength = 250;
				if (this.$scope.storageService.currentTweet.textIdeaWho){
					this.inputText = this.$scope.storageService.currentTweet.textIdeaWho;
				}
			} else if (this.stateName === "app.text_idea_why") {
				this.inputMaxLength = 250;
				if (this.$scope.storageService.currentTweet.textIdeaWhy){
					this.inputText = this.$scope.storageService.currentTweet.textIdeaWhy;
				}
			} else if (this.stateName === "app.text_idea_how") {
				this.inputMaxLength = 500;
				if (this.$scope.storageService.currentTweet.textIdeaHow){
					this.inputText = this.$scope.storageService.currentTweet.textIdeaHow;
				}
			}
		}

		nextClicked(text){
            //On Device Validation is not run
			if (this.$scope.inputForm.$invalid){
                this.$log.debug("Form is invalid");
                this.$scope.inputForm.text.$setTouched();
                return;
            }

			if (this.stateName === "app.text") {
				this.$scope.storageService.currentTweet.txt = text;
			} else if (this.stateName === "app.text_idea_what") {
				this.$scope.storageService.currentTweet.textIdeaWhat = text;
			} else if (this.stateName === "app.text_idea_who") {
				this.$scope.storageService.currentTweet.textIdeaWho = text;
			} else if (this.stateName === "app.text_idea_why") {
				this.$scope.storageService.currentTweet.textIdeaWhy = text;
			} else if (this.stateName === "app.text_idea_how") {
				this.$scope.storageService.currentTweet.textIdeaHow = text;
			}

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
					templateUrl: "ext_rhb/text/text.html",
					controller: 'TextController'
            	});
			$stateProvider
                .state('app.text_idea_what', {
					url: "/textIdeaWhat",
					templateUrl: "ext_rhb/text/text.html",
					controller: 'TextController'
                });
			$stateProvider
                .state('app.text_idea_who', {
					url: "/textIdeaWho",
					templateUrl: "ext_rhb/text/text.html",
					controller: 'TextController'
				});
			$stateProvider
                .state('app.text_idea_why', {
					url: "/textIdeaWhy",
					templateUrl: "ext_rhb/text/text.html",
					controller: 'TextController'
				});
			$stateProvider
                .state('app.text_idea_how', {
					url: "/textIdeaHow",
					templateUrl: "ext_rhb/text/text.html",
					controller: 'TextController'
				});
        }
    ]);
}
