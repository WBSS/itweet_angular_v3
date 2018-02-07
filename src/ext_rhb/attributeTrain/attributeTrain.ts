module itweet.attributeTrain {

	export interface RhBAttributeTrainControllerScope extends itweet.AppControllerScope{
		vm: RhBAttributeTrainController;
	}

	export class RhBAttributeTrainController {
		public loaded: Boolean = false;
		public trains:any;
		public selectedTrain:any;
		public searchTrainText: string;
		public wagons:any;
		public selectedWagon:any;
		public addedWagons: any = [];
		public searchWagonText: string;
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
			$scope.menu_parameters.title = gettextCatalog.getString('object_title');
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
			$scope.vm.searchTrainText = undefined;
			$scope.vm.searchWagonText = undefined;

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
			if (this.$scope.storageService.currentTweet.itemQs.wagonsIds) {
				let metadata = this.network.metadataService.getResponseData();
				this.addedWagons = [];
				for (var i = 0; i < this.$scope.storageService.currentTweet.itemQs.wagonsIds.length; i++) {
					let wagon = this.getWagonById(this.$scope.storageService.currentTweet.itemQs.wagonsIds[i], metadata);
					let wagonDisplay, wagonQuery: string;

					if (wagon.orgCode === "6130") {
						// Road vehicles
						wagonDisplay = wagon.objectName;
						// Add owner if available
						if (wagon.owner) {
							wagonDisplay +=  " : " + wagon.owner;
						}
						wagonQuery = wagon.objectName.toLowerCase();
					} else {
						// Train vehicles
						wagonDisplay = wagon.wagonNr + " : " + wagon.objectName;
						// Add owner if available
						if (wagon.owner) {
							wagonDisplay +=  " : " + wagon.owner;
						}
						wagonQuery = wagon.wagonNr.toLowerCase() + " " + wagon.objectName.toLowerCase();
					}
					var newWagon = {
						id: wagon.id,
						display: wagonDisplay,
						query: wagonQuery
					}
					this.addedWagons.push(newWagon);
				}
			}
		}

		updateByMeta(meta: itweet.model.MetadataResponse = this.network.metadataService.getResponseData()) {

			if(meta.trains){
				this.trains = new Array();
				for (var i=0; i<meta.trains.length;i++){
					if (meta.trains[i].enabled) {
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
			}
			if (meta.wagons){
				let refCategoryQs = this.network.metadataService.getCategoryQsById(this.$scope.storageService.currentTweet.itemQs.refItemCategoryQsId);
				let vehicleType = this.getVehicleTypeFromCategoryQs(refCategoryQs, meta);
				let orgCode = undefined;
				let wagonDisplay, wagonQuery: string;

				if (vehicleType === "train") {
					orgCode = "6750";
				} else if (vehicleType === "road") {
					orgCode = "6130";
				}

				this.wagons = [];
				for (var i = 0; i < meta.wagons.length; i++){
					if (meta.wagons[i].enabled
						&& (vehicleType === "all" || (meta.wagons[i].orgCode === orgCode))) {

						if (meta.wagons[i].orgCode === "6130") {
							// Road vehicles
							wagonDisplay = meta.wagons[i].objectName;
							// Add owner if available
							if (meta.wagons[i].owner) {
								wagonDisplay +=  " : " + meta.wagons[i].owner;
							}
							wagonQuery = meta.wagons[i].objectName.toLowerCase();
						} else {
							// Train vehicles
							wagonDisplay = meta.wagons[i].wagonNr + " : " + meta.wagons[i].objectName;
							// Add owner if available
							if (meta.wagons[i].owner) {
								wagonDisplay +=  " : " + meta.wagons[i].owner;
							}
							wagonQuery = meta.wagons[i].wagonNr.toLowerCase() + " " + meta.wagons[i].objectName.toLowerCase();
						}
						var newWagon = {
							id: meta.wagons[i].id,
							display: wagonDisplay,
							query: wagonQuery
						}
						this.wagons.push(newWagon);
					}
				}
			}
			this.loaded = true;
		}

		querySearch(type: string, query: string, list: any) {
			var results;
			if (type === "wagon") {
				results = list.filter(this.createFilterMatchWithin(query));
			} else {
				results = list.filter(this.createFilterMatchStart(query));
			}
			return results.slice(0, 50);
		}

		createFilterMatchWithin(input: string) {
			var query = input.toLowerCase();
			return function filterFn(item: any) {
				var i = (item.query.indexOf(query) >= 0);
				return i;
			};
		}

		createFilterMatchStart(input: string) {
			var query = input.toLowerCase();
			return function filterFn(item: any) {
				var i = (item.query.indexOf(query) === 0);
				return i;
			};
		}

		getFullTrain(train){
			return (train.trainNr+' : '+train.carrier+' : '+train.route).toString();
		}

		onSelectedWagon() {
			if (!this.selectedWagon)
				return;

			this.addWagon(this.selectedWagon);
			// Resets
			var wagonACScope: any = angular.element(document.getElementById('wagonAC')).scope();
			wagonACScope.$mdAutocompleteCtrl.clear();
			this.selectedWagon = null;
			this.$window.document.activeElement.blur();
		}

		addWagon(refWagon: any) {
			if (refWagon) {
				for (var i = 0; i < this.addedWagons.length; i++) {
					if (this.addedWagons[i].id === refWagon.id) {
						return;
					}
				}
				this.addedWagons.push(refWagon);
			}
		}

		removeWagon(i: number) {
			this.addedWagons.splice(i, 1);
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

			// Set wagons
			if (this.addedWagons.length !== 0) {
				this.$scope.storageService.currentTweet.itemQs.wagonsIds = [];
				this.$scope.storageService.currentTweet.itemQs.wagonsNames = [];
				for (var i = 0; i < this.addedWagons.length; i++) {
					this.$scope.storageService.currentTweet.itemQs.wagonsIds.push(this.addedWagons[i].id);
					this.$scope.storageService.currentTweet.itemQs.wagonsNames.push(this.addedWagons[i].display);
				}
			} else {
				this.$scope.storageService.currentTweet.itemQs.wagonsIds = null;
				this.$scope.storageService.currentTweet.itemQs.wagonsNames = null;
			}

			this.$scope.navigationService.next();
		}

		getWagonById(id: string, metadata: any) {
			if (!id) return null;
			for (var i = 0; i < metadata.wagons.length; i++) {
				if (metadata.wagons[i].id === id) {
					return metadata.wagons[i];
				}
			}
		}

		getVehicleTypeFromCategoryQs(refCategoryQs: any, metadata: any) {
			var categoryQsTree = this.network.metadataService.getCategoryQsTree(refCategoryQs);

			if (!categoryQsTree) {
				return "all";
			}
			// Check if is main category "Fahrzeuge"
			if (categoryQsTree[0].id !== 1 || !categoryQsTree[1]) {
				return "all";
			}
			// Check category "Fahrzeuge"
			if (categoryQsTree[1].id === 6 || categoryQsTree[1].id === 7 || categoryQsTree[1].id === 8 || categoryQsTree[1].id === 9) {
				return "train";
			} else {
				return "road";
			}
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