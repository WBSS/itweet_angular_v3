module itweet.alltweets {

    export interface AlltweetsControllerScope extends itweet.AppControllerScope{
		vm: AlltweetsController;
	}

	export class AlltweetsController {
        public static $inject = ['$scope', 'gettextCatalog', '$interval', '$mdDialog', 'ItweetConfig', '$log', '$sce'
		];
        
        private inappBrowser:any;
        private timeoutRunner:ng.IPromise<any>;
        
        constructor(
            protected $scope:AlltweetsControllerScope,
            protected gettextCatalog,
            protected $interval:ng.IIntervalService,
            protected $mdDialog,
            protected ItweetConfig:itweet.model.BaseConfig,
            protected $log:ng.ILogService,
            protected $sce:ng.ISCEService){
                this.$scope.networkServiceHolder['primary'] = {loading:false};
                $scope.vm = this;
                $scope.menu_parameters.title = "";
    			$scope.menu_parameters.icon = 'arrow_back';
    			$scope.menu_parameters.navigate = 'back';
                
                this.startInAppBrowser();
        }
        
        startInAppBrowser():void{
             this.$scope.networkServiceHolder['primary'].loading = true;
                
            var url = this.AllTweetsUrl();
            this.inappBrowser = window.open(url , '_blank', 'hidden=yes,location=no,toolbar=no');
            this.timeoutRunner = this.$interval(
                () => {
                    this.inappBrowser.close();
                    this.alertUser(this.gettextCatalog.getString('error_html5_container_timeout'))
                }, this.ItweetConfig.web_container_timeout, 1);
            this.inappBrowser.addEventListener('loadstop', () => {
                this.$scope.$apply(()=>{
                    this.$log.debug('background window loaded');
             this.$scope.networkServiceHolder['primary'].loading = false;
                    this.$interval.cancel(this.timeoutRunner);
                    this.inappBrowser.show();
                }
                );
             });
            this.inappBrowser.addEventListener('loadstart', (event) => {
                let url = event.url + "";
                this.$log.debug("Start loading url: "+url);
                if (url.indexOf("close") >= 0) { //close on any close encounter
                    this.inappBrowser.close();
                }
            });
            
            this.inappBrowser.addEventListener('exit', () => {
                this.$log.debug("inappBrowser Closed");
                this.closePage();
            });

         // close InAppBrowser after 5 seconds
         //setTimeout(function() {
         //    ref.close();
         //}, 5000);
        }

        closePage():void{
            this.$interval.cancel(this.timeoutRunner);
            this.$scope.navigationService.previous();
        }
        
        alertUser(message:string):void{
            var alertPromise = this.$mdDialog.confirm({
                title: this.gettextCatalog.getString('error_html5_container_loading_title'),
                content: this.gettextCatalog.getString(message),
                ok: this.gettextCatalog.getString('general_button_okay')
            });
            this.$mdDialog.show( alertPromise )
                .finally(function() {
                    this.$mdDialog.hide(alertPromise);
                    alertPromise = undefined;
                    this.closePage();
                });
        }
        
        //Missplaced
        AllTweetsUrl():string{
            var lat = this.$scope.storageService.currentTweet.latDevice;
			var lng = this.$scope.storageService.currentTweet.lngDevice;
            var token = this.$scope.storageService.user.token || this.$scope.storageService.currentTweet.contextToken;
            //var userid = this.$scope.storageService.user.userID;
            
			var url =     this.ItweetConfig.endpoint_myitems+"/"+this.ItweetConfig.appId+"/"+lat+"/"+lng+"/"+
                             this.ItweetConfig.langISO+"/"+this.ItweetConfig.countryISO+"/"+this.ItweetConfig.platform+"/"+token;
                             
            this.$log.debug( "Tweet URL: "+url);
            
            return this.$sce.trustAsResourceUrl(url);
        }
	}

}