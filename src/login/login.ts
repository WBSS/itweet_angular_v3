module itweet.login {

	export interface LoginControllerScope extends itweet.AppControllerScope{
		categoryService: itweet.model.CategoryService; //weil wir den SCREENNAME von Categories brauchen
		vm: LoginController;
        inputForm: any;
	}
	export class LoginController {
		// $inject annotation.
		// It provides $injector with information about dependencies to be injected into constructor
		// it is better to have it close to the constructor, because the parameters must match in count and type.
		// See http://docs.angularjs.org/guide/di
		public static $inject = [
			'$scope', 'gettextCatalog', 'itweetNetwork', '$mdToast', '$mdDialog', '$log','$q'
		];

		// dependencies are injected via AngularJS $injector
		// controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
		constructor(
			private $scope: LoginControllerScope,
			private gettextCatalog,
            private network: itweet.model.ServiceFactory,
            private $mdToast: angular.material.IToastService,
            private $mdDialog,
            private $log,
            private $q
		) {
            $scope.networkServiceHolder['primary'] = network.loginService;
            $scope.categoryService = network.categoryService;
            
			$scope.vm = this;
			$scope.menu_parameters.title = gettextCatalog.getString('login_title_logedin');
			$scope.menu_parameters.icon = 'arrow_back';
			$scope.menu_parameters.navigate = 'back';
		}


            //         var mydialog = this.$mdDialog.confirm()
                
            //     .title('This is an alert title')
            //     .content('You can specify some description text in here.')
            //     .ariaLabel('Alert Dialog Demo')
            //     .clickOutsideToClose(false);

            // this.$mdDialog.show(mydialog)
            //     .finally(
            //         ()=>{
            //         this.$log.debug("finally dialog");
            //         mydialog = undefined;
            //     }
            //     );

		loginClicked(){
            //On Device Validation is not run
            if (this.$scope.inputForm.$invalid){
                this.$log.debug("Form is invalid");
                this.$scope.inputForm.iusername.$setTouched();
                this.$scope.inputForm.ipassword.$setTouched();
                this.$scope.$apply();
                return;
            }

            var defered =  this.$q.defer();
            var ourData = new ProgressDialogData("login_title_login", "login_button_login", true, defered);

            /* to cancel: */
           // defered.resolve("cancel");

            var dialogPromise = this.$mdDialog.show({
                // targetEvent: $event,
                templateUrl: 'app/progress_dialog.tpl.html',
                controller: ProgressDialogController,
                onComplete: null,
                locals: { data: ourData },
                bindToController: false
            });

            this.network.loginService.run(defered).then(
				()=> {
                   this.$mdDialog.hide(dialogPromise);
                   //ourData.title = "Hello World";
                },
            	()=> {
                    ourData.title = 'login_status_fail';
            		ourData.text = this.network.loginService.responseError;
                    ourData.progressing = undefined;
                },
                ()=> {
            	   this.$log.debug("Progress");
                }
            )
            .finally(
            	()=>{
            		this.$log.debug("finally network");
                    //this.$mdDialog.cancel();
            	}
            );
		}

        logoutClicked(){
            this.network.loginService.logout();
        }
	}

	angular.module('itweet.login', ['gettext','ui.router','ngMaterial', 'ngMessages'])
            .controller('LoginController', LoginController)
             .config(
    ["$stateProvider", // more dependencies
        ($stateProvider:angular.ui.IStateProvider) =>
        {
        	$stateProvider
        	    .state('app.login', {
                url: "/login",
                templateUrl: "login/login.html",
                controller: 'LoginController'
            });
            
        }
    ]);


}
