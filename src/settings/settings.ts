module itweet.settings {

	export interface SettingsControllerScope extends itweet.AppControllerScope{
		vm: SettingsController;
        items: any[];
        version: string;
	}
	export class SettingsController {
		public static $inject = [
			'$scope', 'gettextCatalog', '$mdDialog', '$log',
		];

		constructor(
			private $scope: SettingsControllerScope,
			private gettextCatalog,
            private $mdDialog,
            private $log
		) { 
			$scope.vm = this;
			$scope.menu_parameters.title = gettextCatalog.getString('settings_title');
			$scope.menu_parameters.icon = 'arrow_back';
			$scope.menu_parameters.navigate = 'back';

            if(typeof(cordova) === "undefined"){
                this.$scope.version = " - ";
            }else{
                cordova.getAppVersion.getVersionNumber(
                    (v) => {this.$scope.version = v;}
                );
            }

            $scope.items = [
                {title: gettextCatalog.getString("settings_title_profil"), state: "app.mydata"},
                {title: gettextCatalog.getString("settings_title_login"), state: "app.login"},
                {title: gettextCatalog.getString("settings_title_my_items"), state: "app.mytweets"},
                {title: gettextCatalog.getString("error_html5_container_loading_title"), state: "app.alltweets"},
                {title: gettextCatalog.getString("settings_title_help"), state: "app.help"},
                {title: gettextCatalog.getString("settings_title_demands"), state: "app.disclaimer"},
                {title: gettextCatalog.getString("settings_title_clear_cache"), state: ""}
            ];

		}

		itemClicked(action:string):void{
            if(action && action.length > 0){
                this.$scope.navigationService.go(new itweet.navigation.State(action));
            }else{
                this.clearCache();
            }
        }
        
        clearCache():void{
            var alertPromise = this.$mdDialog.confirm({
                title: this.gettextCatalog.getString('settings_message_cache_title'),
                content: this.gettextCatalog.getString('settings_message_cache_question'),
                ok: this.gettextCatalog.getString('general_button_okay'),
                cancel: this.gettextCatalog.getString('personel_button_cancel')
            });
            this.$mdDialog.show( alertPromise )
            .then(
                ()=> {
                   //clear cache
                   this.$scope.storageService.clearCache();
                   this.notifyCacheCleared();
                }
            )
            .finally(function() {
                this.$mdDialog.hide(alertPromise);
                alertPromise = undefined;
            });
        }
        
        notifyCacheCleared():void{
            var alertPromise = this.$mdDialog.confirm({
                title: this.gettextCatalog.getString('settings_message_cache_title'),
                content: this.gettextCatalog.getString('settings_message_cache_message'),
                ok: this.gettextCatalog.getString('general_button_okay')
            });
            this.$mdDialog.show( alertPromise )
                .finally(function() {
                    this.$mdDialog.hide(alertPromise);
                    alertPromise = undefined;
                });
        }
	}

	angular.module('itweet.settings', ['gettext','ui.router','ngMaterial'])
            .controller('SettingsController', SettingsController)
             .config(
    ["$stateProvider", // more dependencies
        ($stateProvider:angular.ui.IStateProvider) =>
        {
        	$stateProvider
        	    .state('app.settings', {
                url: "/settings",
                templateUrl: "settings/settings.html",
                controller: 'SettingsController'
            });
            
        }
    ]);

}
