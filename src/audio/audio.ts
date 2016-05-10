module itweet.audio {

	export interface AudioControllerScope extends itweet.AppControllerScope{
		vm: AudioController;
		recorderService: itweet.model.RecorderService;
	}

	export class AudioController {

		public static $inject = [
			'$scope', 'gettextCatalog', 'itweetMedia', '$mdToast', '$mdDialog', '$log','$q'
		];

		constructor(
			private $scope: AudioControllerScope,
			private gettextCatalog,
			private itweetMedia: itweet.model.MediaFactory,
			private $mdToast: angular.material.IToastService,
			private $mdDialog,
			private $log,
			private $q
		) {
			
			$scope.vm = this;
			$scope.recorderService = itweetMedia.recorderService;
			$scope.recorderService.initState();
			
			$scope.menu_parameters.title = gettextCatalog.getString('speech_title');
			$scope.menu_parameters.icon = 'arrow_back';
			$scope.menu_parameters.navigate = 'back';
		}

		recordToggle(){
			this.itweetMedia.recorderService.toggleRecording();
		}

		replayToggle() {
			this.itweetMedia.recorderService.toggleReplay();
		}

		deleteRecording() {
			this.itweetMedia.recorderService.deleteRecording();
		}

	}

	angular.module('itweet.audio', ['gettext','ui.router','ngMaterial', 'ngMessages'])
			.controller('AudioController', AudioController)
			 .config(
	["$stateProvider", // more dependencies
		($stateProvider:angular.ui.IStateProvider) =>
		{
			$stateProvider
				.state('app.audio', {
				url: "/audio",
				templateUrl: "audio/audio.html",
				controller: 'AudioController'
			});
			
		}
	]);;
}
