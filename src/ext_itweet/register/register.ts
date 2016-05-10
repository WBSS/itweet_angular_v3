module itweet.register {
	interface RegisterControllerScope extends AppControllerScope{
		vm: RegisterController
		inputForm:any
	}
	export class RegisterController {

		
		public static $inject = [
			'$scope', '$previousState', '$log', '$state', 'gettextCatalog', 'ItweetStorage','ItweetNavigation'
		];

		private user: itweet.model.User;
		
		constructor(
			private $scope: RegisterControllerScope,
			private $previousState,
			private $log,
			private $state,
			private gettextCatalog,
			private ItweetStorage: itweet.model.StorageService,
			private itweetNavigation: itweet.navigation.NavigationService
		) {
			$scope.vm = this;
			//create temp object in case of a cancel
			this.user = angular.copy(ItweetStorage.user);

			this.$scope.menu_parameters.title = this.gettextCatalog.getString('personel_title');
			this.$scope.menu_parameters.navigate = 'back';
			
			if(this.ItweetStorage.shouldDismissRegister()){
				this.itweetNavigation.go(void 0,true);
			}
			if(this.$previousState.get() == undefined){
				this.$scope.menu_parameters.icon = undefined;
			}else{
				this.$scope.menu_parameters.icon = 'arrow_back';
			}
		}

		saveRegister() {
			//On Device Validation is not run
			if (this.$scope.inputForm.$invalid){
          this.$log.debug("Form is invalid");
          this.$scope.inputForm.iemail.$setTouched();
          this.$scope.inputForm.iname.$setTouched();
          return;
      }			

      //refill data from temp object
      angular.extend(this.ItweetStorage.user,this.user);
      if(this.ItweetStorage.initial){
				this.itweetNavigation.go(void 0,true);
    	} else {
				this.$scope.navigationService.previous();         		
    	}

		}

	}

	angular.module('itweet.register', ['gettext','ui.router', 'ct.ui.router.extras.previous', 'ngMaterial', 'ngMessages','itweet.storage'])
            .controller('RegisterController', RegisterController)
             .config(
    ["$stateProvider", "$urlRouterProvider", // more dependencies
        ($stateProvider, $urlRouterProvider) =>
        {
        	$stateProvider
        	    .state('app.mydata', {
                url: "/register",
                templateUrl: "ext_itweet/register/register.html",
                controller: 'RegisterController'//,
                //onEnter: 'RegisterController.onEnter()'
            });
            
        }
    ]);;
}
