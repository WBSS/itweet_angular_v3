module itweet.location {

	export interface RhbLocationControllerScope extends itweet.AppControllerScope {
		vm: RhbLocationController;
	}

	export class RhbLocationController {
		public locations: any;
		public selectedLoaction: any;
		public searchLocationText:string;
		public locationDisabled:boolean=false;
		public tracks: any;
		public selectedTrack: any;
		public currentTrackPosition: any;
		public searchTrackText:string;
		public loaded: Boolean = false;
		public locationElement:any;
		public static $inject = [
			'$scope', '$previousState', '$state', 'gettextCatalog', 'itweetNetwork', 'ItweetStorage', '$stateParams','ItweetNavigation','$window'
		];

		// dependencies are injected via AngularJS $injector
		// controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
		constructor(
			private $scope: RhbLocationControllerScope,
			private $previousState,
			private $state: angular.ui.IState,
			private gettextCatalog,
            private network: itweet.model.RHBServiceFactory,
			private ItweetStorage: itweet.model.StorageService,
			private $stateParams: angular.ui.IStateParamsService,
			private itweetNavigation: itweet.navigation.NavigationService,
			private $window
			) {

            $scope.networkServiceHolder['primary'] = network.metadataService;
			$scope.vm = this;
			$scope.menu_parameters.title = gettextCatalog.getString("location_title");
			$scope.menu_parameters.icon = 'arrow_back';
			$scope.menu_parameters.navigate = 'back';
			$scope.networkServiceHolder['primary'] = network.metadataService;
			
			$scope.$watch(() => { return network.metadataService.getResponseData() }, (newValue: itweet.model.MetadataResponse, oldValue) => {
				this.updateByMeta(newValue);
			});
			
			$scope.vm.searchLocationText = "";
			$scope.vm.locationDisabled=false;
			$scope.vm.searchTrackText = "";
			$scope.vm.currentTrackPosition = new Array("","");
			
			if(this.$scope.storageService.currentTweet.itemQs.refLocationId){
				console.log('set storaged location',this.$scope.storageService.currentTweet.itemQs.refLocationName);
				$scope.vm.searchLocationText = this.$scope.storageService.currentTweet.itemQs.refLocationName;
				this.selectedLoaction = {
					id:this.$scope.storageService.currentTweet.itemQs.refLocationId,
					name:this.$scope.storageService.currentTweet.itemQs.refLocationName
				}
			}
			if(this.$scope.storageService.currentTweet.itemQs.refTrackId){
				$scope.vm.searchTrackText = this.$scope.storageService.currentTweet.itemQs.refTrackName;
				this.selectedTrack = {
					id:this.$scope.storageService.currentTweet.itemQs.refTrackId,
					name:this.$scope.storageService.currentTweet.itemQs.refTrackName
				}
			}
			
			if(this.$scope.storageService.currentTweet.itemQs.trackPosition){
				let _pos = this.$scope.storageService.currentTweet.itemQs.trackPosition.toString();
				$scope.vm.currentTrackPosition = _pos.split(".");
			}
			
			/* RHB FIX: FIXME REFACTOR */
			$scope.$watch(()=>  { return network.contextService.getResponseData(); }, (data)  => {
				if (data && data.length == 1) {
					var context = data[0];
					this.$scope.storageService.currentTweet.contextToken = context.contextToken;
				}
			});
			
			
		}

		updateByMeta(meta: itweet.model.MetadataResponse = this.network.metadataService.getResponseData()) {
			
			if(meta.locations){
				this.locations = new Array();
				for (var i=0; i<meta.locations.length;i++){
					var newLocation = {
						id: meta.locations[i].id,
						name: meta.locations[i].name,
						query: meta.locations[i].name.toLocaleLowerCase()
					}
					this.locations.push(newLocation);
				}
				
			}
			if(meta.locations){
				this.loaded = true;
				this.tracks = new Array();
				for (var i=0; i<meta.tracks.length;i++){
					var newTrack = {
						id: meta.tracks[i].id,
						name: meta.tracks[i].name,
						query: meta.tracks[i].name.toLocaleLowerCase()
					}
					this.tracks.push(newTrack);
				}
			}
		}
		
		selectedLoactionChange(location){
			console.log('change location');
			if(typeof location != 'undefined'){
				this.$window.document.activeElement.blur();
				this.selectedLoaction = location;
			} else this.selectedLoaction = null;
			
		}
		
		selectedTrackChange(track){
			console.log('change track',track);
			if(typeof track != 'undefined'){
				this.selectedTrack = track;
				this.$window.document.activeElement.blur();
			} else this.selectedTrack = null;
		}

		querySearch(query,list){
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
		getFullText(item){
			return item.name.toString();
		}

		save() {
			if(this.selectedLoaction){
				console.log('save location', this.selectedLoaction);
				this.$scope.storageService.currentTweet.itemQs.refLocationId = this.selectedLoaction.id;
				this.$scope.storageService.currentTweet.itemQs.refLocationName = this.selectedLoaction.name;
			} else
			{
				this.$scope.storageService.currentTweet.itemQs.refLocationId = null;
				this.$scope.storageService.currentTweet.itemQs.refLocationName = null;

			}
			
			if(this.selectedTrack){
				this.$scope.storageService.currentTweet.itemQs.refTrackId = this.selectedTrack.id;
				this.$scope.storageService.currentTweet.itemQs.refTrackName = this.selectedTrack.name;
			} else
			{
				this.$scope.storageService.currentTweet.itemQs.refTrackId = null;
				this.$scope.storageService.currentTweet.itemQs.refTrackName = null;
			}
			
			if(this.currentTrackPosition[0] != "" || this.currentTrackPosition[1] != ""){
				if(this.currentTrackPosition[1] == "") this.currentTrackPosition[1] ="0"
				if(this.currentTrackPosition[0] == "") this.currentTrackPosition[0] ="0"
				this.$scope.storageService.currentTweet.itemQs.trackPosition = +(this.currentTrackPosition[0]+"."+this.currentTrackPosition[1]);
			} else this.$scope.storageService.currentTweet.itemQs.trackPosition = null;
			
			this.$scope.navigationService.next();
		}
	}

	angular.module('itweet.rhb.location', ['gettext', 'ui.router', 'ngMaterial'])
		.controller('RhbLocationController', RhbLocationController)
		.config(
			["$stateProvider", // more dependencies
				($stateProvider: angular.ui.IStateProvider) => {
					$stateProvider
						.state('app.rhb_location', {
							url: "/locationrhb",
							templateUrl: "ext_rhb/location/location.html",
							controller: 'RhbLocationController'
						});

				}
			]);;
}
