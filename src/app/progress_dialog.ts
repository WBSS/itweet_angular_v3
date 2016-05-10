module itweet {
    export class ProgressDialogData {
        public extension:string;
        constructor(public title:string,
                    public text:string,
                    public progressing:boolean,
                    public defered:ng.IDeferred<any>,
                    public success:boolean = false) {
        }

    }
    interface ProgressDialogScope extends ng.IScope {
        dmv: ProgressDialogController;
        data: ProgressDialogData;
    }


    export class ProgressDialogController {
        public static $inject = [
            '$scope', 'gettextCatalog', '$mdDialog', '$log', 'data'
        ];

        constructor(private $scope:ProgressDialogScope,
                    private gettextCatalog,
                    private $mdDialog,
                    private $log: ng.ILogService,
                    private data:ProgressDialogData) {
            $scope.dmv = this;
            $scope.data = data;
        }

        cancel() {
            this.$scope.data.defered.resolve("cancel by user");
        }

        closeDialog() {
            this.$mdDialog.hide();
        }
    }

}