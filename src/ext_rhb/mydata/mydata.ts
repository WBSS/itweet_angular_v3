module itweet.mydata {

	export interface RhbMydataControllerScope extends itweet.AppControllerScope {
		vm: RhBMydataController;
	}

	export class RhBMydataController {
		public persons: any;
		public loaded: Boolean = false;
		public selectedPerson: any;
		public searchText: string;
		public searchPlaceholder:string;
		public validPerson: Boolean = true;
		public static $inject = [
			'$scope', '$previousState', '$state', 'gettextCatalog', 'itweetNetwork', 'ItweetStorage', '$stateParams','ItweetNavigation','$window'
		];

		// dependencies are injected via AngularJS $injector
		// controller's name is registered in Application.ts and specified from ng-controller attribute in index.html
		constructor(
			private $scope: RhbMydataControllerScope,
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
			$scope.menu_parameters.title = this.$scope.menu_parameters.title = this.gettextCatalog.getString("mydata_title");
			
			if(this.ItweetStorage.shouldDismissRegister()){
				this.itweetNavigation.go(void 0,true);
			}
			if(this.$previousState.get() == undefined){
				this.$scope.menu_parameters.icon = undefined;
			}else{
				this.$scope.menu_parameters.icon = 'arrow_back';
			}
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
			$scope.vm.searchText = "";
			$scope.vm.searchPlaceholder = this.gettextCatalog.getString('search');
			
			
		}

		updateByMeta(meta: itweet.model.MetadataResponse = this.network.metadataService.getResponseData()) {
			
			if(meta.persons){
				this.loaded = true;
				this.persons = new Array();
				for (var i=0; i<meta.persons.length;i++){
					var newPerson = {
						id: meta.persons[i].id,
						firstName: meta.persons[i].firstName,
						lastName: meta.persons[i].lastName,
						department: meta.persons[i].department,
						query: meta.persons[i].firstName.toLowerCase()+' '+meta.persons[i].lastName.toLowerCase(),
						queryReverse: meta.persons[i].lastName.toLowerCase()+' '+meta.persons[i].firstName.toLowerCase()
					}
					this.persons.push(newPerson);
				}
				console.log(this.persons);
				
				if(this.ItweetStorage.user.userID){
					var p = this.persons[this.persons.map(function(e) { return e.id; }).indexOf(this.ItweetStorage.user.userID)];
					this.searchText = this.getFullPerson(p);
					this.selectedPerson = p;
				}
				
			}
		}

		save() {
			if(this.selectedPerson != null){
				this.$scope.vm.validPerson = true;
				var newUser: itweet.model.User = angular.copy(this.ItweetStorage.user);
				newUser.userID = this.selectedPerson.id;
				newUser.name = this.selectedPerson.lastName;
				newUser.firstName = this.selectedPerson.firstName;
				newUser.department = this.selectedPerson.department;
				
				angular.extend(this.ItweetStorage.user,newUser);
				if(this.ItweetStorage.initial){
					this.itweetNavigation.go(void 0,true);
					// this.$previousState.forget();
				} else {
					this.$scope.navigationService.previous();         		
				}
			} else {
				this.selectedPerson = null;
				this.$scope.vm.validPerson = false;
			}
		}

		querySearch (query) {
			var results = this.persons.filter(this.createFilterFor(query));
			var t = results.slice(0,25);
			return t;
		}

		createFilterFor(q) {
			var query = q.toLowerCase();
			return function filterFn(person) {
				var i = (person.id.indexOf(query) == 0);
				if(i) return i;
				else i = (person.query.indexOf(query) == 0);
				
				if(i) return i
				else  i = (person.queryReverse.indexOf(query) == 0);
				
				return i;
			};
		}

		searchTextChange (textChange){
			console.log('text change');
		}
		selectedPersonChange (item){
			console.log('person change');
			if(typeof item != 'undefined'){
				this.selectedPerson = item;
				this.$window.document.activeElement.blur();
				
			}
		}

		getFullPerson (person){
			if(person.id)return person.id+', '+person.firstName+' '+person.lastName+', '+person.department;
			else return "";
		}
	}

	angular.module('itweet.rhb.mydata', ['gettext', 'ui.router', 'ngMaterial'])
		.controller('RhBMydataController', RhBMydataController)
		.config(
			["$stateProvider", // more dependencies
				($stateProvider: angular.ui.IStateProvider) => {
					$stateProvider
						.state('app.mydata', {
							url: "/mydatarhbdata",
							templateUrl: "ext_rhb/mydata/mydata.html",
							controller: 'RhBMydataController'
						});

				}
			]);
}
