module itweet.attributeTime {

	export interface RhBAttributeTimeControllerScope extends itweet.AppControllerScope{
		vm: RhBAttributeTimeController;
	}

	export class RhBAttributeTimeController {
		public newSelectedDate:Date;
		public invalidDate:boolean=false;
		public timeDays:string[] = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"];
		public timeMonths:string[] = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
		public timeYear:string[] =["2013","2014","2015","2016","2017","2018","2019","2020"];
		public timeHours:string[] = ["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24"];
		public timeMinutes:string[] = ["00","05","10","15","20","25","30","35","40","45","50","55"];
		public newSelectDay:string = "";
		public newSelectMonth:number = null;
		public newSelectYear:string = "";
		public newSelectHours:number = null;
		public newSelectMinutes:number = null;

		public static $inject = [
			'$scope', 'gettextCatalog', 'itweetNetwork', 'ItweetStorage', '$mdToast', '$mdDialog', '$log','$q'
		];

		constructor(
			private $scope: RhBAttributeTimeControllerScope,
			private gettextCatalog,
            private network: itweet.model.RHBServiceFactory,
			private ItweetStorage: itweet.model.StorageService,
            private $mdToast: angular.material.IToastService,
            private $mdDialog,
            private $log,
            private $q
		) {
			$scope.vm = this;
			$scope.menu_parameters.title = gettextCatalog.getString('attribute_title_time');
			$scope.menu_parameters.icon = 'arrow_back';
			$scope.menu_parameters.navigate = 'back';
			
			if(this.$scope.storageService.currentTweet.itemQs.dateEvent){
				this.setDate(new Date(parseInt(this.$scope.storageService.currentTweet.itemQs.dateEvent)));
			} else {
				this.setDate(new Date());
			}
			this.invalidDate=false;
		}

		setDate(newDate){
			console.log("setDate",newDate);
			this.newSelectDay = newDate.getUTCDate().toString();
			this.newSelectMonth = newDate.getMonth();
			this.newSelectYear = newDate.getFullYear().toString();
			
			this.newSelectHours = newDate.getHours();
			this.newSelectMinutes = parseInt((newDate.getMinutes()/5).toString(),10);
		}

		nextClicked(){
			var newDate = new Date();
			newDate.setUTCDate(+this.newSelectDay);
			newDate.setUTCMonth(+this.newSelectMonth);
			newDate.setUTCFullYear(+this.newSelectYear);
			newDate.setHours(+this.newSelectHours);
			newDate.setMinutes(+this.timeMinutes[this.newSelectMinutes]);
			
			this.invalidDate=false;
			if(+this.newSelectDay!=newDate.getUTCDate()){
				this.invalidDate=true;
			} else{
				this.$scope.storageService.currentTweet.itemQs.dateEvent = newDate.getTime().toString();
				this.$scope.navigationService.next();
				
			}
			
		}
	}

	angular.module('itweet.rhb.attributeTime', ['gettext','ui.router','ngMaterial'])
            .controller('RhBAttributeTimeController', RhBAttributeTimeController)
             .config(
    ["$stateProvider", // more dependencies
        ($stateProvider:angular.ui.IStateProvider) =>
        {
        	$stateProvider
        	    .state('app.rhb_attribute_time', {
                url: "/attributeTime",
                templateUrl: "ext_rhb/attributeTime/attributeTime.html",
                controller: 'RhBAttributeTimeController'
            });
            
        }
    ]);;
}
