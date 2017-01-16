module itweet.overview {

    export class itweetOverviewController extends OverviewController {

        sendTweet() {
            var defered = this.$q.defer();
            var ourData = new ProgressDialogData(this.gettextCatalog.getString("upload_status_title"), this.gettextCatalog.getString("upload_status_tweet"), true, defered, false);
            var dialogPromise = this.$mdDialog.show({
                // targetEvent: $event,
                templateUrl: 'app/progress_dialog.tpl.html',
                controller: ProgressDialogController,
                onComplete: null,
                locals: {data: ourData},
                bindToController: false
            }).finally(()=> {
                if (ourData.success) {
                    //this.$scope.navigationService.startNewTweet();
                    return;
                }
            })
            this.network.iTweetUploader.upload([this.$scope.storageService.currentTweet], defered, ourData).then(
                ()=> {

                    ourData.progressing = undefined;
                    ourData.text = this.gettextCatalog.getString("general_info_created_message");
                    ourData.success = true;
                    //this.$mdDialog.hide(dialogPromise);
                },
                ()=> {
                    ourData.progressing = undefined;
                    if (defered.promise.$$state.status > 0) {
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