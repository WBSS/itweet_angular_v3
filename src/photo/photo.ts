module itweet.photo {

	export interface PhotoControllerScope extends itweet.AppControllerScope{
		vm: PhotoController;
		mediaService: itweet.model.MediaService;
		images: any[]
	}

	export class PhotoController {

		public static $inject = [
			'$scope', 'gettextCatalog', 'itweetMedia', '$mdToast', '$mdBottomSheet', '$log','$q','ItweetConfig','$timeout'
		];

		private index: number;
		private entries_with_image = [];
		private entries_without_image = [];

		constructor(
			private $scope: PhotoControllerScope,
			private gettextCatalog,
            private itweetMedia: itweet.model.MediaFactory,
            private $mdToast: angular.material.IToastService,
            private $mdBottomSheet,
            private $log,
            private $q,
			private config:itweet.model.BaseConfig,
			private $timeout:angular.ITimeoutService
		) {
			$scope.vm = this;
			this.$scope.networkServiceHolder['primary'] = {loading:false};
			$scope.mediaService = itweetMedia.mediaService;
			$scope.menu_parameters.title = gettextCatalog.getString('photo_title');
			$scope.menu_parameters.icon = 'arrow_back';
			$scope.menu_parameters.navigate = 'back';
			$scope.$watch(($scope:PhotoControllerScope) =>{ $log.info("watch called"); return $scope.mediaService.dataImages()},(newValue,oldValue) => {
				this.updatePhotos(newValue);
			},true );
			this.entries_with_image = [
			    { name: gettextCatalog.getString('photo_action_sheet_button_1'), icon: 'share-arrow' },
			    { name: gettextCatalog.getString('photo_action_sheet_button_2'), icon: 'upload' },
			    { name: gettextCatalog.getString('photo_action_sheet_button_delete'), icon: 'copy' },
			    { name: gettextCatalog.getString('photo_action_sheet_button_cancel'), icon: 'print' }
			];
			this.entries_without_image = [
			    { name: gettextCatalog.getString('photo_action_sheet_button_1'), icon: 'share-arrow' },
			    { name: gettextCatalog.getString('photo_action_sheet_button_2'), icon: 'upload' },
			    { name: gettextCatalog.getString('photo_action_sheet_button_cancel'), icon: 'print' }
			];
		}

		updatePhotos(newValue=this.$scope.mediaService.dataImages()){
			this.$scope.images = newValue.map((value,index,array) =>  {return {index:index,value:value||'img/camera/camera_cleargrey.png'}});
			this.$timeout(() => {this.$scope.$digest();},0,true);
		}

		addPhoto(index:number){
			this.index = index;
			this.$log.debug("addPhoto()");

			var entry = this.itweetMedia.mediaService.dataImages()[index];
			var entries = entry ? this.entries_with_image : this.entries_without_image;
			var ourData = {
				title: this.gettextCatalog.getString("photo_action_sheet_title"),
				entries: entries
			  };

			var bottomSheetPromise = this.$mdBottomSheet.show({
		      templateUrl: 'app/bottom_sheet.tpl.html',
		      controller: BottomSheetController,
		      locals: {data: ourData },
		      bindToController: false
		    });

		    bottomSheetPromise.then(
				(index)=> {
                   this.$log.debug("index("+index+")");
				   switch (index)
				    {
				        case true: { /* WTF */
							console.log('show library');
							this.showLibrary();
							break;
				        }
				        case 1: {
							this.showCamera();
				        	break;
				        }
						case 2: {
							if(entry){
						   		this.itweetMedia.mediaService.deleteImage(this.index);
								 this.$timeout(() => {this.updatePhotos()},0,true);
							}
						   break;
						}
				        default: {
				            console.log("default case");
				        }
				    }
                }
            )
            .finally(
            	()=>{
            		this.$log.debug("finally ");
                    this.$mdBottomSheet.hide();
            	}
            );
		}

		showCamera(){
		    navigator.camera.getPicture(
		    	(val) => {this.onSuccess(val)},
		    	(val) => {this.onFail(val)},
			     { quality: 50,
			        destinationType:  Camera.DestinationType.FILE_URI,
			        sourceType: Camera.PictureSourceType.CAMERA,
			        targetWith: this.config.image_width,
			        targetHeight: this.config.image_height,
					 encodingType: Camera.EncodingType.JPEG,
					 correctOrientation: true
				 }
			);
		}

		showLibrary() {
			console.log('get library', navigator.camera);
		    navigator.camera.getPicture(
		    	(val) => {this.onSuccess(val)},
		    	(val) => {this.onFail(val)},
		    	{ quality: 50,
		        	destinationType: Camera.DestinationType.FILE_URI,
		        	sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
					encodingType: Camera.EncodingType.JPEG,
					targetWith: this.config.image_width,
					targetHeight: this.config.image_height,
					correctOrientation: true
				}
		    );
  		}

  		onSuccess(imageURI){
			 this.$scope.$apply(() => {
 			this.$log.debug("onSuccess.uri = "+imageURI);
		    if(imageURI.length > 500){
		      imageURI = "data:image/jpeg;base64," + imageURI;
		    }
			this.$timeout(() => {
						this.$scope.networkServiceHolder['primary'].loading = true;
						this.$scope.$digest();},0,true);
			
		    this.itweetMedia.mediaService.saveImage(imageURI,this.index).then(() => {
							this.$scope.networkServiceHolder['primary'].loading = false;
							this.$timeout(() => {this.updatePhotos()},0,true);
			});
			});
  		}

  		onFail(message){
  			//alert('Image Selection failed because: ' + message);
  			this.$mdBottomSheet.hide();
  		} 

	}
  
	angular.module('itweet.photo', ['gettext','ui.router','ngMaterial', 'ngMessages'])
            .controller('PhotoController', PhotoController)
             .config(
    ["$stateProvider", // more dependencies
        ($stateProvider:angular.ui.IStateProvider) =>
        {
        	$stateProvider
        	    .state('app.photo', {
                url: "/photo",
                templateUrl: "photo/photo.html",
                controller: 'PhotoController'
            });
            
        }
    ]);
}
