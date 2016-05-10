module itweet.overview {

	export interface OverviewControllerScope extends itweet.AppControllerScope{
		vm: OverviewController;
		categoryService: itweet.model.CategoryService;
		mediaService: itweet.model.MediaService;
	}
	/**
	 *
	 */
	export class OverviewController {

		public static $inject = [
			'$scope', '$log', '$state', 'gettextCatalog', 'itweetNetwork','itweetMedia','$q','$mdDialog','$timeout','ItweetConfig'
		];
		public testDate:Date;

		constructor(
			protected $scope: OverviewControllerScope,
			protected $log,
			protected $state,
			protected gettextCatalog,
			protected network: itweet.model.ServiceFactory,
			public itweetMedia: itweet.model.MediaFactory,
			public $q,
			public $mdDialog,
            protected $timeout,
			protected config:itweet.model.BaseConfig
		) {
			$scope.vm = this;
			$scope.categoryService = network.categoryService;
			$scope.mediaService = itweetMedia.mediaService;
			this.onEnter();
			//$scope.$on('$stateChangeStart', this.onEnter());
		}

		onEnter(){
			this.$log.debug("onEnter");
			this.$scope.menu_parameters.title = this.gettextCatalog.getString('overview_title');
		}

		gotoDetail(destination:string) {
			this.$scope.navigationService.go(new itweet.navigation.State(destination));
		}

        undoSend(){
            var alertPromise = this.$mdDialog.confirm({
                title: this.gettextCatalog.getString('overview_delete_option_title'),
                content: this.gettextCatalog.getString('overview_delete_option_message'),
                ok: this.gettextCatalog.getString('general_button_okay'),
                cancel: this.gettextCatalog.getString('personel_button_cancel')
            });
            this.$mdDialog.show( alertPromise )
                .then(
                ()=> {
                    this.network.iTweetService.tweet = this.$scope.storageService.currentTweet;
                    this.network.iTweetService.undo = true;
                    this.network.iTweetService.run();
                    this.$scope.navigationService.startNewTweetSilent();
                }
            )
                .finally(function() {
                    this.$mdDialog.hide(alertPromise);
                    alertPromise = undefined;
                });
        }

		saveTweet() {
            this.$scope.storageService.saveTweet(this.$scope.storageService.currentTweet);
            var alertPromise = this.$mdDialog.confirm({
                title: this.gettextCatalog.getString('item_save_title'),
                content: this.gettextCatalog.getString('item_save_text'),
                ok: this.gettextCatalog.getString('general_button_okay')
            });
            this.$mdDialog.show( alertPromise )
                .finally(function() {
                    this.$mdDialog.hide(alertPromise);
                    alertPromise = undefined;
                });
			// save to store
		}
		
		validateTweet(currentTweet){
			//if(!currentTweet.txt) return false;
            return true;
        }
		
		confirmSendTweet() {
			console.log(this.validateTweet(this.$scope.storageService.currentTweet));
			if(this.validateTweet(this.$scope.storageService.currentTweet)){

				var alertPromise = this.$mdDialog.confirm({
					title: this.gettextCatalog.getString('general_info_send_title'),
					content: this.gettextCatalog.getString('general_info_send_message'),
					ok: this.gettextCatalog.getString('general_button_okay'),
					cancel: this.gettextCatalog.getString('option_button_no')
				});
				this.$mdDialog.show( alertPromise )
					.then( () => {
                        this.$timeout(() => {this.sendTweet();});
                    }
					)
					.finally(()=> {
						this.$mdDialog.hide(alertPromise);
						alertPromise = undefined;
					});
			} else {
				var invalidPromise = this.$mdDialog.alert({
					title: this.gettextCatalog.getString('overview_alert_mandatory_title'),
					content: this.gettextCatalog.getString('overview_alert_mandatory'),
					ok: this.gettextCatalog.getString('general_button_okay')
				});
				this.$mdDialog.show( invalidPromise );
			}
		}

		sendTweet() {
			var defered =  this.$q.defer();
			var ourData = new ProgressDialogData(this.gettextCatalog.getString("upload_status_title"), this.gettextCatalog.getString("upload_status_tweet"), true,defered,false);
			var dialogPromise = this.$mdDialog.show({
				// targetEvent: $event,
				templateUrl: 'app/progress_dialog.tpl.html',
				controller: ProgressDialogController,
				onComplete: null,
				locals: { data: ourData },
				bindToController: false
			}).finally(()=> {
				if(ourData.success){
					this.$scope.navigationService.startNewTweet();
				}
			})
			this.network.iTweetUploader.upload([this.$scope.storageService.currentTweet],defered,ourData).then(
				()=> {

                    ourData.progressing = undefined;
                    ourData.text = this.gettextCatalog.getString("general_info_created_message");
					ourData.success = true;
                    //this.$mdDialog.hide(dialogPromise);
				},
				()=> {
					ourData.progressing = undefined;
                    if(defered.promise.$$state.status > 0) {
                        ourData.text = this.gettextCatalog.getString("general_info_send_canceled");
                    } else {
                        ourData.text = this.gettextCatalog.getString("general_info_created_failed_message");
                    }
                },
				()=> {
				}
			)
		}

	}
}