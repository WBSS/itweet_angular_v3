module itweet.map {
	/**
	 * The main controller for the app. The controller:
	 * - retrieves and persists the model via the todoStorage service
	 * - exposes the model to the template and provides event handlers
	 */
	declare  var google;

	interface MapScope extends itweet.AppControllerScope{
		gmap: any;
		searchbox: any;
		currentTweetPos: any;
		vm: MapController;
		isWatchPosNew: any;
	}
	export class MapController {
		private currentTweetPosMarker: any;
		private isInitialPos: boolean;
		private currentPosCircle: any;
		public logCircle: any;
		private center: any;
		private latitudeDefault: number;
		private longitudeDefualt: number;


		//public loadOverlay:any
		// $inject annotation.
		// It provides $injector with information about dependencies to be injected into constructor
		// it is better to have it close to the constructor, because the parameters must match in count and type.
		// See http://docs.angularjs.org/guide/di
		public static $inject = [
			'$scope','$log', 'gettextCatalog','uiGmapGoogleMapApi','uiGmapIsReady','ItweetStorage',
			'ItweetNavigation','$rootScope','itweetNetwork'
		];


		// dependencies are injected via AngularJS $injector
		// controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
		constructor(
			private $scope,
			private $log: ng.ILogService,
			private gettextCatalog,
			private uiGmapGoogleMapApi,
			private uiGmapIsReady,
			private ItweetStorage : itweet.model.StorageService,
			private ItweetNavigation: itweet.navigation.NavigationService,
			private $rootScope: angular.IRootScopeService,
			public iTweetNetwork: itweet.model.ServiceFactory
		) {
			$scope.vm = this;

			// defaults (WBSS zurich)
			this.latitudeDefault=47.3738203;
		    this.longitudeDefualt=8.5357981;

			/* app ctrl */
			$scope.menu_parameters = {'fullscreen':false};
			$scope.menu_parameters.title = gettextCatalog.getString('location_title');
			$scope.storageService = ItweetStorage;
			$scope.navigationService = ItweetNavigation;
			$scope.brand = iTweetNetwork.brandService;

			//App Navigation Flow
			ItweetStorage.initial = false;

			// auto actual position
			this.isInitialPos = false;

			// configure gmap
			$scope.gmap = {
				// default map center
				center: { latitude: this.latitudeDefault, longitude: this.longitudeDefualt },
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
					center_changed: (map) => {
					},
					click: (map) => {
						$log.debug('event: map clicked');
						$scope.$apply(() => {this.toggleFullscreen();});
					}
				},
				// map view options
				options: {disableDefaultUI: true,
					mapTypeId: ItweetStorage.user.mapType || "satellite",
					tilt: 0,
				},
			}

			if(ItweetStorage.currentTweet.lat != 0) {
				$scope.currentTweetPos = {
					latitude: ItweetStorage.currentTweet.lat,
					longitude: ItweetStorage.currentTweet.lng
				};
				if ($scope.currentTweetPos.latitude) {
					$scope.gmap.center.latitude = angular.copy($scope.currentTweetPos.latitude);
					$scope.gmap.center.longitude = angular.copy($scope.currentTweetPos.longitude);
					$scope.manual = true;
				}
			}
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
								console.log('map load: with itweetStorage geos');
							}
						}
						else {this.isInitialPos = true;}
					});
				});
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

			// set geo position app startup
			 $scope.$watch(() => { return this.$scope.position }, (dataNew, dataOld) => {
			 	if(dataNew && this.isInitialPos){
					this.isInitialPos = false;
					this.updatePos();
			 	}

			 }, false);

			$scope.$on("$destroy", () =>{
				this.geocode();
			});
		}

		updatePos(){
			if(!this.$scope.manual
				&& this.$scope.position
				&& this.$scope.position.coords
				&& this.$scope.gmap.map){
				//var
				let coords: any;
				let accurancy: number;
				//set var
				coords = this.$scope.position.coords;
				// constrain radius
				coords.accuracy >= 200 ? 200 : accurancy = coords.accuracy ;

				if(this.currentPosCircle == null)
				{
					this.setCircle(coords);
				}
				else
				{
					this.currentPosCircle.setCenter(new google.maps.LatLng(coords.latitude, coords.longitude));
					this.currentPosCircle.setRadius(accurancy);
				}

				// center map current position
				this.$scope.gmap.map.setCenter(new google.maps.LatLng(coords.latitude, coords.longitude));
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

		setCircle(currentPos: any) {
		 	this.currentPosCircle = new google.maps.Circle({
				map: this.$scope.gmap.map,
				center: new google.maps.LatLng(currentPos.latitude, currentPos.longitude),
				radius: currentPos >= 200 ? 200 : currentPos.accuracy,
				strokeOpacity: 0.8,
				strokeColor: "#4284f4",
			    fillColor: "#4284f4",
				fillOpacity: 0.5
			});
		}
	}
	angular.module('itweet.map', ['gettext','ui.router','ngMaterial','uiGmapgoogle-maps','ngCordova'])
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
			key: 'AIzaSyCn8zzN0dwWB22iImBpQYowkDscrK8pgXk',
			v: '3.26',
			libraries: 'places',
			language:document.lang
		});
	});


}
