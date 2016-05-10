module itweet {
    export class BottomSheetData {
        constructor(
            public title: string,
            public entries:any[]) {
        }
    }

    interface BottomSheetScope extends ng.IScope {
        dmv: BottomSheetController;
        data: BottomSheetData;
    }


    export class BottomSheetController {
        public static $inject = [
            '$scope', 'gettextCatalog', '$mdBottomSheet', '$log', 'data'
        ];

        constructor(private $scope:BottomSheetScope,
                    private gettextCatalog,
                    private $mdBottomSheet,
                    private $log: ng.ILogService,
                    private data:BottomSheetData) {
            $scope.dmv = this;
            $scope.data = data;
        }

        listItemClick(index) {
            this.$log.debug("Clicked( "+index+" )");
            this.$mdBottomSheet.hide(index);
        }
    }

}