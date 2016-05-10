module itweet.map {
	/**
	 * The main controller for the app. The controller:
	 * - retrieves and persists the model via the todoStorage service
	 * - exposes the model to the template and provides event handlers
	 */
	declare  var google;

	interface MapScope extends itweet.AppControllerScope{
		//position: any;
		manual: boolean;
		gmap: any;
		searchbox: any;
		markeroptions: any;
		crosshairoptions: any;
		circleoptions:any;
		currentTweetPos: any;
		vm: MapController;
		isWatchPosNew: any;
	}
	export class MapController {
		private currentTweetPosMarker: any;
		private isInitialPos: boolean;


		//public loadOverlay:any
		// $inject annotation.
		// It provides $injector with information about dependencies to be injected into constructor
		// it is better to have it close to the constructor, because the parameters must match in count and type.
		// See http://docs.angularjs.org/guide/di
		public static $inject = [
			'$scope', '$state', 'gettextCatalog', 'uiGmapGoogleMapApi','uiGmapIsReady','ItweetStorage',
			'$timeout','ItweetNavigation','$rootScope','itweetNetwork','$mdDialog', '$cordovaGeolocation'
		];

		private center: any;

		// dependencies are injected via AngularJS $injector
		// controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
		constructor(
			//private $scope: MapScope,
			private $scope,
			private $state : angular.ui.IStateService,
			private gettextCatalog,
			private uiGmapGoogleMapApi,
			private uiGmapIsReady,
			private ItweetStorage : itweet.model.StorageService,
			private $timeout: angular.ITimeoutService,
			private ItweetNavigation: itweet.navigation.NavigationService,
			private $rootScope: angular.IRootScopeService,
			public iTweetNetwork: itweet.model.ServiceFactory,
			private $mdDialog,
			private $cordovaGeolocation
		) {
			$scope.vm = this;

			/* app ctrl */
			$scope.menu_parameters = {'fullscreen':false};
			$scope.menu_parameters.title = gettextCatalog.getString('location_title');
			$scope.storageService = ItweetStorage;
			$scope.navigationService = ItweetNavigation;
			$scope.brand = iTweetNetwork.brandService;

			//App Navigation Flow
			ItweetStorage.initial = false;

			// auto actual position
			$scope.manual = false;
			this.isInitialPos = false;


			// configure gmap
			$scope.gmap = {
				// default map center
				//center: { latitude: 47.3738203, longitude: 8.5357981 },
				center: { latitude: 46.854806418346406, longitude: 9.530209799110247 },
				zoom: 16,
				// register events
				events:{
					bounds_changed: (map) => {
						var bounds =  map.getBounds();
						$scope.$apply(() => {$scope.searchbox.options.bounds = bounds;});
						if(this.center){
							map.panTo(this.center);
							this.center = undefined;
						}
					},
					zoom_changed:(map) => {
					},
					maptypeid_changed:(map)=>{
						//this.$mdDialog.hide(this.loadOverlay);
					},
					center_changed: (map) => {
						$scope.manual = true;

					},
					click: (map) => {
						$scope.$apply(() => {this.toggleFullscreen();});
					}
				},
				// map view options
				options: {disableDefaultUI: true,
					mapTypeId: ItweetStorage.user.mapType || "satellite",
					tilt: 0,
				},
				// ??
				control: undefined,
				map: undefined,
			};

			// set map center:
			// if data in itweetStorage load
			// else load actual position
			/*
			if(ItweetStorage.currentTweet.lat != 0){
				$scope.currentTweetPos = {latitude: ItweetStorage.currentTweet.lat,longitude:ItweetStorage.currentTweet.lng};
				if($scope.currentTweetPos.latitude) {
					$scope.gmap.center.latitude = angular.copy($scope.currentTweetPos.latitude);
					$scope.gmap.center.longitude = angular.copy($scope.currentTweetPos.longitude);
					$scope.manual = true;
					this.setMarker($scope.currentTweetPos);
					console.log('map load 1: with itweetStorage geos');
				}
			} else {
				console.log('map load 1: update geos');
				this.updatePos();
			};*/

			/*
			 maps instances passed back to you come back with the following info:
			 instance: map instance number (internal counter for ui-gmap on which map)
			 map: The actual gMap (google map sdk instance of the google.maps.Map).
			 map.uiGmap_id: A unique UUID that gets assigned to the gMap via ui-gamp api
			 */
			uiGmapIsReady.promise(1)
				.then((instances) => {
					instances.forEach((inst) => {
						// instanc
						$scope.gmap.map = inst.map;
						// set map center:
						if(ItweetStorage.currentTweet.lat != 0){
							$scope.currentTweetPos = {latitude: ItweetStorage.currentTweet.lat,longitude:ItweetStorage.currentTweet.lng};
							if($scope.currentTweetPos.latitude){
								$scope.gmap.map.setCenter({lat: $scope.currentTweetPos.latitude, lng: $scope.currentTweetPos.longitude});
								$scope.manual = true;
								this.setMarker($scope.currentTweetPos);
								console.log('map load 2: with itweetStorage geos');
							}
						}
						else {this.isInitialPos = true;}
					});
				});
			// config circule
			$scope.circleoptions = {
				stroke:{
					opacity:0
				},
				fill:{
					opacity:0.5,
					color:"#4284f4"
				}
			}
			// add searchbox
			$scope.searchbox = { template:'map/map.search.html',options:{}, events:{
				places_changed: (searchBox) => {
					var places = searchBox.getPlaces();
					angular.forEach(places, (place) => {
						ItweetStorage.currentTweet.address = place.formatted_address;
						var pos = place.geometry.location;
						this.$scope.gmap.map.panTo(pos);

					});
				}
			}};
			/*
			$scope.$watch(() => { return $scope.position }, (dataNew, dataOld) => {
				if(dataNew){
					let coords = dataNew.coords;
					var currentTweet = this.ItweetStorage.currentTweet;
					currentTweet.latDevice = coords.latitude;
					currentTweet.lngDevice = coords.longitude;
					currentTweet.eleDevice = coords.altitude;
					$scope.isWatchPosNew = coords.latitude;
				}
			}, false);*/

			// set geo position app startup
			 $scope.$watch(() => { return $scope.position }, (dataNew, dataOld) => {
			 	if(dataNew && this.isInitialPos){
					this.isInitialPos = false;
					this.updatePos();
			 	}
			 }, false);

			/*
			$scope.$watch("gmap.control",(newValue,oldValue) =>{
				if(newValue) {
					this.resizeMap();
				}
			});*/

			$scope.$on("$destroy", () =>{
				this.ItweetStorage.currentTweet.manual = this.$scope.manual?1:0;
				this.geocode();
			});
		}

		updatePos(){
			if(!this.$scope.manual && this.$scope.position && this.$scope.position.coords && this.$scope.gmap.map){
				let coords = this.$scope.position.coords;
				this.$scope.gmap.map.setCenter({
					lat: coords.latitude,
					lng: coords.longitude
				});
			}
		}

		// zoom map up
		zoomPlus() {
			console.log('is zoom up' + this.$scope.gmap.zoom );
			this.$scope.gmap.zoom = Math.min(this.$scope.gmap.zoom + 1,20);
		}

		// zoom map down
		zoomMinus() {
			this.$scope.gmap.zoom = Math.max(this.$scope.gmap.zoom - 1,4);
		}

		// search button position
		myPosition() {
			this.$scope.manual = false;
			this.updatePos();
		}

		// toogle map view
		toggleMap() {
			/*this.loadOverlay = this.$mdDialog.show({
			 template: "<md-progress-circular md-mode=\"indeterminate\"></md-progress-circular>"
			 })*/
			switch(this.ItweetStorage.user.mapType){
				case google.maps.MapTypeId.SATELLITE:
					//this.$scope.gmap.options.mapTypeId = google.maps.MapTypeId.HYBRID;
					this.$scope.gmap.map.setMapTypeId(google.maps.MapTypeId.HYBRID);
					break;
				case google.maps.MapTypeId.HYBRID:
					//this.$scope.gmap.options.mapTypeId = google.maps.MapTypeId.TERRAIN;
					this.$scope.gmap.map.setMapTypeId(google.maps.MapTypeId.TERRAIN);
					break;
				case google.maps.MapTypeId.TERRAIN:
					//this.$scope.gmap.options.mapTypeId = google.maps.MapTypeId.ROADMAP;
					this.$scope.gmap.map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
					break;
				default :
					//this.$scope.gmap.options.mapTypeId = google.maps.MapTypeId.SATELLITE;
					this.$scope.gmap.map.setMapTypeId(google.maps.MapTypeId.SATELLITE);
			}
			this.ItweetStorage.user.mapType = this.$scope.gmap.map.getMapTypeId();

		}
		/*
		hideDialog(){
			console.log('finished2222');
			this.$mdDialog.hide();
		}*/

		// resolve locatioon
		geocode(){
			var tweet = this.ItweetStorage.currentTweet;
			tweet.location = "";
			tweet.lat = this.$scope.gmap.map.getCenter().lat();
			tweet.lng = this.$scope.gmap.map.getCenter().lng();
			this.uiGmapGoogleMapApi
				.then((maps) => {
					var geocoder = new google.maps.Geocoder();
					var latlng = new google.maps.LatLng(tweet.lat,tweet.lng);
					geocoder.geocode({'latLng': latlng}, (results, status) => {
						if (status == google.maps.GeocoderStatus.OK) {
							if (results[0]) {
								this.$rootScope.$apply(() => {
									//tweet.location = results[0].formatted_address
									var parts = {};
									results[0].address_components.forEach( (value) => {
										value.types.forEach((type) => {
											parts[type] = value.long_name;
										})
									});
									tweet.location = (parts["locality"] || "") + ", " +(parts["route"]||"") + " " + (parts["street_number"]||"");
								});

							}
						}

					});
				});
		}

		resizeMap(){
			if (this.$scope.gmap.map.control.getGMap ){
				var map = this.$scope.gmap.map.ctrl.getGMap();
				this.center = map.getCenter();
				google.maps.event.trigger(map, 'resize');
			}
		}

		toggleFullscreen(){
			this.$scope.searchbox.options.visible = this.$scope.menu_parameters.fullscreen;
			this.$scope.menu_parameters.fullscreen = !this.$scope.menu_parameters.fullscreen;
		}

		// set itweet marker on map
		setMarker(currentTweetPos: any){
			this.currentTweetPosMarker = new google.maps.Marker();
			this.currentTweetPosMarker.setPosition(new google.maps.LatLng(currentTweetPos.latitude, currentTweetPos.longitude));
			this.currentTweetPosMarker.setMap(this.$scope.gmap.map);
		}
	}

	angular.module('itweet.map', ['gettext','ui.router', 'ngMaterial', 'uiGmapgoogle-maps', 'ngCordova'])
		.controller('MapController', MapController)
		.config(
			["$stateProvider", "$urlRouterProvider", // more dependencies
				($stateProvider, $urlRouterProvider) =>
				{
					$stateProvider
						.state('map', {
							url: "/map",
							templateUrl: "ext_itweet/map/map.html",
							controller: 'MapController'
						});

				}
			]).config(function(uiGmapGoogleMapApiProvider) {
		uiGmapGoogleMapApiProvider.configure({

			v: '3.23',
			libraries: 'places',
			language:document.lang
		});
	});


}
