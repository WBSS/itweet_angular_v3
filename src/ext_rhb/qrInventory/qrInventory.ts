module itweet.qrInventory {

	export interface RhBQrInventoryControllerScope extends itweet.AppControllerScope {
		vm: RhBQrInventoryController;
	}

	export class RhBQrInventoryController {
		public static $inject = [
			'$rootScope', '$scope', 'gettextCatalog', 'ItweetStorage', '$mdToast', '$log','$q','$window', 'ItweetConfig', '$http', '$timeout', 'itweetNetwork'
		];

		public qrObject: any;
		public record: itweet.model.Record;
		public loading: boolean;
		public error: any;

		constructor(
			private $rootScope: angular.IRootScopeService,
			private $scope: RhBQrInventoryControllerScope,
			private gettextCatalog,
			private ItweetStorage: itweet.model.StorageService,
            private $mdDialog,
            private $log,
            private $q,
			private $window,
			private config: itweet.model.BaseConfig,
			private $http,
			private $timeout,
			private network: itweet.model.RHBServiceFactory
		) {
			$scope.vm = this;
			$scope.menu_parameters.title = "QR Inventar";
			$scope.menu_parameters.icon = 'arrow_back';
			$scope.menu_parameters.navigate = 'back';

			this.qrObject = {};
		}

		scanQrCode() {

			this.network.preventResume = true;

			setTimeout(() => {
				cordova.plugins.barcodeScanner.scan((result) => {

						this.$log.debug("QR result", result);
						if (!result.cancelled) {
							this.qrObject = JSON.parse(result.text);
						}
						this.$scope.$apply();

						setTimeout(() => {
							this.network.preventResume = false;
						}, 500);

					}, (error) => {
						alert("Scanning failed: " + error);

						setTimeout(() => {
							this.network.preventResume = false;
						}, 500);

					}, {
						preferFrontCamera: false, // iOS and Android
						showFlipCameraButton: false, // iOS and Android
						showTorchButton: true, // iOS and Android
						torchOn: false, // Android, launch with the torch switched on (if available)
						prompt: "QR Code innerhalb des Scan-Bereichs positionieren.", // Android
						resultDisplayDuration: 0, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
						formats: "QR_CODE", // default: all but PDF_417 and RSS_EXPANDED
						orientation: "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
						disableAnimations: true, // iOS
						disableSuccessBeep: false // iOS
					}
				);
			}, 500);
		}

		getObjectData(): ng.IPromise<any> {

			// Get host from base url
			let endpoint = this.config.base_url + "getWebServiceRecord/" + this.ItweetStorage.currentTweet.contextToken;

			let webServiceFilter: itweet.model.WebServiceFilter = new itweet.model.WebServiceFilter();
			webServiceFilter.interfaceShort = this.qrObject.interfaceShort;
			webServiceFilter.objectId = this.qrObject.objectId;

			this.loading = true;
			this.error = null;

			return this.$http.put(endpoint, webServiceFilter)
                .then((response: any) => {
					this.$log.debug(response.data);
					this.record = response.data;
				})
                .catch((error: any) => {
					this.record = null;
					this.error = error;
					this.$log.error('XHR Failed for getObjectData.\n', error);
				})
                .finally(() => {
					this.loading = false;
					this.$log.debug("Loading end");
				});
		}
	}

	angular.module('itweet.rhb.qrInventory', ['gettext','ui.router','ngMaterial'])
        .controller('RhBQrInventoryController', RhBQrInventoryController)
        .config(
			["$stateProvider", // more dependencies
				($stateProvider:angular.ui.IStateProvider) =>
				{
					$stateProvider
                        .state('app.rhb_qr_inventory', {
							url: "/qrInventory",
							templateUrl: "ext_rhb/qrInventory/qrInventory.html",
							controller: 'RhBQrInventoryController'
						});

				}
			]);
}