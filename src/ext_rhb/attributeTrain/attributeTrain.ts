module itweet.attributeTrain {

	export interface RhBAttributeTrainControllerScope extends itweet.AppControllerScope{
		vm: RhBAttributeTrainController;
	}

	export class RhBAttributeTrainController {
		public loaded: Boolean = false;
		public trains:any;
		public selectedTrain:any;
		public searchTrainText: string;
		public searchTrainId: any;
		public searchTrainPlaceholder:string;
		public vehicles:any;
		public selectedVehicle:any;
		public searchVehicleText: string;
		public searchVehiclePlaceholder:string;
		public static $inject = [
			'$scope', 'gettextCatalog', 'itweetNetwork', 'ItweetStorage', '$mdToast', '$log','$q','$window'
		];

		constructor(
			private $scope: RhBAttributeTrainControllerScope,
			private gettextCatalog,
            private network: itweet.model.RHBServiceFactory,
			private ItweetStorage: itweet.model.StorageService,
            private $mdDialog,
            private $log,
            private $q,
			private $window
		) {
			$scope.vm = this;
			$scope.menu_parameters.title = gettextCatalog.getString('Objekt');
			$scope.menu_parameters.icon = 'arrow_back';
			$scope.menu_parameters.navigate = 'back';
			$scope.networkServiceHolder['primary'] = network.metadataService;
			
			$scope.$watch(() => { return network.metadataService.getResponseData() }, (newValue: itweet.model.MetadataResponse, oldValue) => {
				this.updateByMeta(newValue);
			});
			/* RHB FIX: FIXME REFACTOR */
			$scope.$watch(()=>  { return network.contextService.getResponseData(); }, (data)  => {
				if (data && data.length == 1) {
					var context = data[0];
					this.$scope.storageService.currentTweet.contextToken = context.contextToken;
				}
			});
			$scope.vm.searchTrainText = "";
			$scope.vm.searchTrainPlaceholder = this.gettextCatalog.getString('Suchen..');
			$scope.vm.searchVehicleText = "";
			$scope.vm.searchVehiclePlaceholder = this.gettextCatalog.getString('Suchen..');

			//if(this.$scope.storageService.currentTweet.itemQs.refTrainId) $scope.vm.searchTrainText  = this.$scope.storageService.currentTweet.itemQs.refTrainId;
			//if(this.$scope.storageService.currentTweet.itemQs.refWagonId) $scope.vm.searchVehicleText  = this.$scope.storageService.currentTweet.itemQs.refWagonId;
			//if(this.$scope.storageService.currentTweet.itemQs.refTrainId) $scope.vm.searchTrainText  = this.$scope.storageService.currentTweet.itemQs.refTrainName;
			//if(this.$scope.storageService.currentTweet.itemQs.refWagonId) $scope.vm.searchVehicleText  = this.$scope.storageService.currentTweet.itemQs.refWagonName;

			if(this.$scope.storageService.currentTweet.itemQs.refTrainId){
				console.log('set storaged location',this.$scope.storageService.currentTweet.itemQs.refTrainId);
				$scope.vm.searchTrainText  = this.$scope.storageService.currentTweet.itemQs.refTrainName;
				this.selectedTrain = {
					id:this.$scope.storageService.currentTweet.itemQs.refTrainId,
					trainNr:this.$scope.storageService.currentTweet.itemQs.refTrainName.split(':')[0],
					carrier:this.$scope.storageService.currentTweet.itemQs.refTrainName.split(':')[1],
					route:this.$scope.storageService.currentTweet.itemQs.refTrainName.split(':')[2]

				}
			}
			if(this.$scope.storageService.currentTweet.itemQs.refWagonId){
				$scope.vm.searchVehicleText = this.$scope.storageService.currentTweet.itemQs.refWagonName;
				this.selectedVehicle = {
					id:this.$scope.storageService.currentTweet.itemQs.refWagonId,
					wagonNr:this.$scope.storageService.currentTweet.itemQs.refWagonName.split(':')[0],
					objectName:this.$scope.storageService.currentTweet.itemQs.refWagonName.split(':')[1],

				}
			}
		}

		updateByMeta(meta: itweet.model.MetadataResponse = this.network.metadataService.getResponseData()) {
			
			if(meta.trains){
				this.trains = new Array();
				for (var i=0; i<meta.trains.length;i++){
					var newTrain = {
						id: meta.trains[i].id,
						carrier: meta.trains[i].carrier,
						route: meta.trains[i].route,
						trainNr: meta.trains[i].trainNr,
						query: meta.trains[i].trainNr
					}
					this.trains.push(newTrain);
				}
			}
			if(meta.wagons){
				this.vehicles = new Array();
				for (var i=0; i<meta.wagons.length;i++){
					var newVehicle = {
						id: meta.wagons[i].id,
						name: meta.wagons[i].name,
						objectName: meta.wagons[i].objectName,
						wagonNr: meta.wagons[i].wagonNr,
						query: meta.wagons[i].wagonNr
					}
					this.vehicles.push(newVehicle);
				}
			}
			this.loaded = true;
		}

		querySearch (query,list) {
			var results = list.filter(this.createFilterFor(query));
			var t = results.slice(0,12);
			return t;
		}

		createFilterFor(q) {
			var query = q.toLowerCase();
			return function filterFn(item) {
				var i = (item.query.indexOf(query) === 0);
				
				return i;
			};
		}

		selectedTrainChange(train){
			console.log('change train',train);
			if(typeof train != 'undefined'){
				this.$window.document.activeElement.blur();
				this.selectedTrain = train;
			}else this.selectedTrain = null;

		}

		selectedVehicleChange(wagon){
			if(typeof wagon != 'undefined'){
				this.$window.document.activeElement.blur();
				this.selectedVehicle = wagon;
			}else this.selectedVehicle  = null;
		}

		getFullTrain(train){
			return (train.trainNr+' : '+train.carrier+' : '+train.route).toString();
		}

		getFullVehicle(wagon){
			return (wagon.wagonNr+' : '+wagon.objectName).toString();
		}

		nextClicked(){
			
			if(this.selectedTrain){
				this.$scope.storageService.currentTweet.itemQs.refTrainId = this.selectedTrain.id;
				this.$scope.storageService.currentTweet.itemQs.refTrainName = this.getFullTrain(this.selectedTrain);
			} else
			{
				this.$scope.storageService.currentTweet.itemQs.refTrainId = null;
				this.$scope.storageService.currentTweet.itemQs.refTrainName = null;
			}

			if(this.selectedVehicle){
				this.$scope.storageService.currentTweet.itemQs.refWagonId = this.selectedVehicle.id;
				this.$scope.storageService.currentTweet.itemQs.refWagonName = this.getFullVehicle(this.selectedVehicle);
			} else
			{
				this.$scope.storageService.currentTweet.itemQs.refWagonId = null;
				this.$scope.storageService.currentTweet.itemQs.refWagonName = null;
			}
			
			this.$scope.navigationService.next();
		}

	}

	angular.module('itweet.rhb.attributeTrain', ['gettext','ui.router','ngMaterial'])
            .controller('RhBAttributeTrainController', RhBAttributeTrainController)
             .config(
    ["$stateProvider", // more dependencies
        ($stateProvider:angular.ui.IStateProvider) =>
        {
        	$stateProvider
        	    .state('app.rhb_attribute_train', {
                url: "/attributeTrain",
                templateUrl: "ext_rhb/attributeTrain/attributeTrain.html",
                controller: 'RhBAttributeTrainController'
            });
            
        }
    ]);;
}