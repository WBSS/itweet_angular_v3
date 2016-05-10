module itweet.mytweets {

	export interface MyTweetsControllerScope extends itweet.AppControllerScope{
		vm: MyTweetsController;
		categoryService: itweet.model.CategoryService;
	}
	export class MyTweetsController {
		public static $inject = [
			'$scope', 'gettextCatalog', 'itweetNetwork', '$mdDialog', '$log', '$filter'
		];

		constructor(
			private $scope: MyTweetsControllerScope,
			private gettextCatalog,
			private network: itweet.model.ServiceFactory,
			private $mdDialog,
            private $log,
            private $filter
		) { 
			$scope.vm = this;
			$scope.categoryService = network.categoryService;
			$scope.menu_parameters.title = gettextCatalog.getString('item_save_title');
			$scope.menu_parameters.icon = 'arrow_back';
			$scope.menu_parameters.navigate = 'back';
            
            var orderby = $filter('orderBy');
            var list = orderby($scope.storageService.allTweets, '-dateAdded', false);
            for (var key in list) {
                if (list.hasOwnProperty(key)) {
                    var element = list[key];
//                    $log.debug(" Element ",element);
                    $log.debug(" Date ",element.dateAdded);
                }
            }
		}

		itemClicked(tweet:itweet.model.Tweet):void {
			this.$log.debug("Tweet clicked: "+tweet.location);
			this.$scope.storageService.currentTweet = tweet;
			this.$scope.navigationService.go(new itweet.navigation.State("app.overview"));
        }

        itemDeleteClicked(tweet: itweet.model.Tweet):void {
        	var alertPromise = this.$mdDialog.confirm({
                title: this.gettextCatalog.getString('item_delete_title'),
                content: this.gettextCatalog.getString('item_delete_text'),
                ok: this.gettextCatalog.getString('option_button_yes'),
                cancel: this.gettextCatalog.getString('option_button_no')
            });
            this.$mdDialog.show( alertPromise )
            .then(
                ()=> {
                	this.$log.debug("Nachricht löschen");
                    this.$scope.storageService.deleteTweet(tweet);
                }
            )
            .finally(function() {
                this.$mdDialog.hide(alertPromise);
                alertPromise = undefined;
            });
        }
	}

	angular.module('itweet.mytweets', ['gettext','ui.router','ngMaterial', 'angular-toArrayFilter'])
            .controller('MyTweetsController', MyTweetsController)
             .config(
    ["$stateProvider", // more dependencies
        ($stateProvider:angular.ui.IStateProvider) =>
        {
        	$stateProvider
        	    .state('app.mytweets', {
                url: "/mytweets",
                templateUrl: "mytweets/mytweets.html",
                controller: 'MyTweetsController'
            });
            
        }
    ]);

}