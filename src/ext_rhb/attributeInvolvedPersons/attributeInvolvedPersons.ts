module itweet.attributeInvolvedPersons {

	export interface RhBAttributeInvolvedPersonsControllerScope extends itweet.AppControllerScope{
		vm: RhBAttributeInvolvedPersonsController;
	}

	export class RhBAttributeInvolvedPersonsController {
		public persons: any;
		public addedPersonsId: Int16Array;
		public addedPersons:any = new Array();
		public storedPersons:number[];
		public loaded: Boolean = false;
		public searchText: string;
		public selectedPerson: any;
		public errorMessage:string ="";

		public static $inject = [
			'$scope', 'gettextCatalog', 'itweetNetwork', 'ItweetStorage', '$mdToast', '$mdDialog', '$log','$q','$window'
		];

		constructor(
			private $scope: RhBAttributeInvolvedPersonsControllerScope,
			private gettextCatalog,
            private network: itweet.model.RHBServiceFactory,
			private ItweetStorage: itweet.model.StorageService,
            private $mdToast: angular.material.IToastService,
            private $mdDialog,
            private $log,
            private $q,
			private $window
		) {
			$scope.vm = this;
			$scope.menu_parameters.title = gettextCatalog.getString('attribute_title_involvedPersons');
			$scope.menu_parameters.icon = 'arrow_back';
			$scope.menu_parameters.navigate = 'back';
			//$scope.vm.addedPersons = [{id:1,firstName:"Peter",lastName:"Müller",department:"Finanzen"},{id:2,firstName:"Michi",lastName:"Maier",department:"Produktion"}]
			
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
			$scope.vm.searchText = undefined;

			this.storedPersons = this.$scope.storageService.currentTweet.itemQs.personsInvolvedIds;
		}

		updateByMeta(meta: itweet.model.MetadataResponse = this.network.metadataService.getResponseData()) {
			
			if(meta.persons){
				this.loaded = true;
				this.persons = new Array();
				for (var i=0; i<meta.persons.length;i++){
					if (meta.persons[i].enabled) {
						var newPerson = {
							id: meta.persons[i].id,
							firstName: meta.persons[i].firstName,
							lastName: meta.persons[i].lastName,
							department: meta.persons[i].department,
							query: meta.persons[i].firstName.toLowerCase() + ' ' + meta.persons[i].lastName.toLowerCase(),
							queryReverse: meta.persons[i].lastName.toLowerCase() + ' ' + meta.persons[i].firstName.toLowerCase()
						}
						this.persons.push(newPerson);
						if (this.storedPersons) {
							for (var j = 0; j < this.storedPersons.length; j++) {
								if (this.storedPersons[j].toString() == newPerson.id.toString()) this.addPerson(newPerson);
							}
						}
					}
				}
			}
		}

		onSelectedInvolvedPerson() {
			this.addPerson(this.selectedPerson);
			// Resets
			this.selectedPerson = null;
			this.searchText = "";
			this.$window.document.activeElement.blur();
		}

		addPerson(refPerson: any) {
			if (refPerson) {
				this.selectedPerson = null;
				for (var i = 0; i < this.addedPersons.length; i++) {
					if (this.addedPersons[i].id === refPerson.id) {
						return;
					}
				}
				this.addedPersons.push(refPerson);
			}
		}

		removePerson(i){
			this.addedPersons.splice(i, 1);
		}

		nextClicked(){
			//this.$scope.storageService.currentTweet.date = this.newSelectedDate.toDateString();
			if(this.addedPersons.length!=0){
				this.$scope.storageService.currentTweet.itemQs.personsInvolvedIds = new Array();
				this.$scope.storageService.currentTweet.itemQs.personsInvolvedNames = new Array();
				for (var i = 0; i < this.addedPersons.length; i++) {
					this.$scope.storageService.currentTweet.itemQs.personsInvolvedNames.push((this.addedPersons[i].id+', '+this.addedPersons[i].firstName+' '+this.addedPersons[i].lastName+', '+this.addedPersons[i].department));
					this.$scope.storageService.currentTweet.itemQs.personsInvolvedIds.push(+this.addedPersons[i].id);
				}
			} else {
				this.$scope.storageService.currentTweet.itemQs.personsInvolvedIds = null;
				this.$scope.storageService.currentTweet.itemQs.personsInvolvedNames = null;
			}
			
            this.$scope.navigationService.next();
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

		getFullPerson (person){
			if(person.id)return person.id+', '+person.firstName+' '+person.lastName+', '+person.department;
			else return "";
		}
	}

	angular.module('itweet.rhb.attributeInvolvedPersons', ['gettext','ui.router','ngMaterial'])
            .controller('RhBAttributeInvolvedPersonsController', RhBAttributeInvolvedPersonsController)
             .config(
    ["$stateProvider", // more dependencies
        ($stateProvider:angular.ui.IStateProvider) =>
        {
        	$stateProvider
        	    .state('app.rhb_attribute_involvedPersons', {
                url: "/attributeInvolvedPersons",
                templateUrl: "ext_rhb/attributeInvolvedPersons/attributeInvolvedPersons.html",
                controller: 'RhBAttributeInvolvedPersonsController'
            });
            
        }
    ]);;
}
