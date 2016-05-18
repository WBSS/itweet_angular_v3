module itweetWeb {
    'use strict';

    // global var
    declare var rhb;

    export interface ItemNewControllerScope extends ng.IScope {
        inputForm: any;
    }

    /** @ngInject */
    export class ItemNewController {
        public item: itweetWeb.model.Item;
        public userService: UserService;
        public files: any[];
        // Autocompletes
        public searchPersonCreatorText: string;
        public searchLocationText: string;
        public searchTrainText: string;
        public searchWagonText: string;
        public searchPersonText: string;
        public searchCategoryQsText: string;
        // Time fields
        public newSelectedDate: Date;
        public timeDays: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"];
        public timeMonths: string[] = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
        public timeYear: string[] = ["2013", "2014", "2015", "2016", "2017", "2018", "2019", "2020"];
        public timeHours: string[] = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24"];
        public timeMinutes: string[] = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
        public newSelectDay: string = "";
        public newSelectMonth: number = null;
        public newSelectYear: string = "";
        public newSelectHours: number = null;
        public newSelectMinutes: number = null;
        // Involved persons fields
        public persons: any;
        public addedPersons: any = [];
        public selectedPerson: itweetWeb.model.Person;
        public currentTrackPosition: string[] = [];
        // Validation
        public invalidPerson: boolean;
        public invalidCategory: boolean;
        public invalidLocation: boolean;
        public invalidDateEvent: boolean;
        public invalidText: boolean;
        public invalidTrain: boolean;
        public invalidPhotos: boolean;
        // Services
        public itemService: ItemService;
        private $log: ng.ILogService;
        private dialogService: DialogService;
        private $scope: ItemNewControllerScope;
        private $state: ng.ui.IStateService;
        private $mdDialog: ng.material.IDialogService;
        private uploadService: any;
        private sha1Service: any;
        private gettextCatalog: any;
        private dialogProgress: any;
        private $q: ng.IQService;
        private $timeout: ng.ITimeoutService;
        // Http endpoint
        public apiUrlEndpoint: string;

        constructor($log: ng.ILogService, itemService: ItemService, userService: UserService, dialogService: DialogService,
                    $scope: ItemNewControllerScope, $state: ng.ui.IStateService, $mdDialog: ng.material.IDialogService,
                    Upload: any, sha1: any, gettextCatalog: any, $q: ng.IQService, $timeout: ng.ITimeoutService) {
            this.$log = $log;
            this.itemService = itemService;
            this.userService = userService;
            this.dialogService = dialogService;
            this.$scope = $scope;
            this.$state = $state;
            this.$mdDialog = $mdDialog;
            this.uploadService = Upload;
            this.sha1Service = sha1;
            this.gettextCatalog = gettextCatalog;
            this.$q = $q;
            this.$timeout = $timeout;
            this.apiUrlEndpoint = rhb.config.apiUrlEndpoint;

            this.itemService.initLists()
                .then(() => {
                    this.item = new itweetWeb.model.Item();
                    this.item.itemQs = new itweetWeb.model.ItemQs();
                    // Set defaults
                    this.item.uploadHashs = [];
                    this.setDateEvent(new Date());
                    this.item.refItemCategory = this.itemService.refItemCategories[0];

                    this.$log.info('Activated Item New View');
                });
        }

        showDialogProgress() {
            if (!this.dialogProgress) {
                this.dialogProgress = this.dialogService.getProgressDialogOptions(this.$scope);
            }
            this.$mdDialog.show(this.dialogProgress);
        }

        validate() {
            var invalid: boolean = false;
            this.invalidPerson = false;
            this.invalidCategory = false;
            this.invalidLocation = false;
            this.invalidDateEvent = false;
            this.invalidText = false;
            this.invalidTrain = false;
            this.invalidPhotos = false;

            // Person
            if (!this.item.itemQs.refPerson) {
                this.invalidPerson = true;
                invalid = true;
            }
            // Category
            if (this.item.refItemCategory.id !== this.itemService.refItemCategories[2].id) { // No categoryQs for "Ideen/Vorschlaege"
                if (!this.item.itemQs.refItemCategoryQs) {
                    this.invalidCategory = true;
                    invalid = true;
                }
            }
            // Location
            if (!this.item.itemQs.refLocation && !this.item.itemQs.refTrack
                && !this.currentTrackPosition[0] && !this.currentTrackPosition[1]) {
                this.invalidLocation = true;
                invalid = true;
            }
            // Track position
            /*
           if (this.currentTrackPosition[0] || this.currentTrackPosition[1]) {
                if (!isFinite(Number(this.currentTrackPosition[0])) || !isFinite(Number(this.currentTrackPosition[1]))) {
                    this.invalidLocation = true;
                    invalid = true;
                }
            }*/
            // DateEvent
            var newDate = new Date();
            newDate.setUTCDate(+this.newSelectDay);
            newDate.setUTCMonth(+this.newSelectMonth);
            newDate.setUTCFullYear(+this.newSelectYear);
            newDate.setHours(+this.newSelectHours);
            newDate.setMinutes(+this.timeMinutes[this.newSelectMinutes]);

            if (+this.newSelectDay !== newDate.getUTCDate()) {
                this.invalidDateEvent = true;
                invalid = true;
            } else {
                this.item.itemQs.dateEvent = newDate.getTime();
            }
            // Text
            if (!this.item.txt || !(this.item.txt.length > 0)) {
                this.invalidText = true;
                invalid = true;
            }
            // Train/Wagon
            /*
            if (!(this.item.itemQs.refTrain || this.item.itemQs.refWagon)) {
                this.invalidTrain = true;
                invalid = true;
            }*/
            // Photos
            if (this.files && this.files.length > 3) {
                this.invalidPhotos = true;
                invalid = true;
            }
            return !invalid;
        }

        submit() {
            var i = 0;

            this.showDialogProgress();
            this.item.guid = this.generateUUID();
            // Defaults
            this.item.lat = 0;
            this.item.lng = 0;
            if (this.item.refItemCategory)
            // Set persons involved
                this.item.itemQs.personsInvolvedIds = [];
            for (i = 0; i < this.addedPersons.length; i++) {
                this.item.itemQs.personsInvolvedIds.push(this.addedPersons[i].id);
            }
            // Set track position
            if (this.currentTrackPosition[0] !== null) {
                this.item.itemQs.trackPosition = Number(this.currentTrackPosition[0] + "." + this.currentTrackPosition[1]);
            }
            // Make sure that no categoryQs is selected for "Ideen/Vorschlaege"
            if (this.item.refItemCategory.id === this.itemService.refItemCategories[2].id) {
                this.item.itemQs.refItemCategoryQs = null;
            }

            this.uploadFiles()
                .then(() => {
                    this.$log.debug("Files uploaded");
                    // Save item
                    return this.itemService.saveItem(this.item);
                })
                .then((resp: any) => {
                    this.$log.debug("Item saved");
                    this.$mdDialog.hide();
                    // Clear item cache
                    this.itemService.clearCache();
                    this.$state.go("items");
                })
                .catch((error: any) => {
                    this.$log.error(error);
                    this.$mdDialog.hide();
                    this.dialogService.showAlert("Es ist ein Fehler aufgetreten:", error.error + ", " + error.exception + ", " + error.message);
                });
        }

        confirmSubmit() {
            if (this.validate()) {
                var alertPromise = this.$mdDialog.confirm()
                    .title("Meldung senden?")
                    .content("Möchten Sie die Meldung nun senden?")
                    .ok("Okay")
                    .cancel("Nein");

                this.$mdDialog.show(alertPromise)
                    .then(() => {
                this.$timeout(() => {
                    this.submit();
                });})
                .finally(()=> {
                    this.$mdDialog.hide(alertPromise);
                  alertPromise = undefined;
                });

            } else {
                this.$log.info('Form invalid');
            }
        }

        removeFile(index: number) {
            this.$log.info("index: " + index);
            this.files.splice(index, 1);
        }

        generateUUID() {
            var d = new Date().getTime();
            if (window.performance && typeof window.performance.now === "function") {
                d += performance.now(); //use high-precision timer if available
            }
            var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
            return uuid;
        }

        setDateEvent(newDate) {
            this.newSelectDay = newDate.getUTCDate().toString();
            this.newSelectMonth = newDate.getMonth();
            this.newSelectYear = newDate.getFullYear().toString();

            this.newSelectHours = newDate.getHours();
            this.newSelectMinutes = parseInt((newDate.getMinutes() / 5).toString(), 10);
        }

        addPerson(person: itweetWeb.model.Person) {
            if (person) {
                this.selectedPerson = null;
                for (var i = 0; i < this.addedPersons.length; i++) {
                    if (this.addedPersons[i].id === person.id) {
                        return;
                    }
                }
                this.addedPersons.push(person);
            }
        }

        removePerson(i: number) {
            this.addedPersons.splice(i, 1);
        }

        uploadFiles() {
            var promise;
            var promises = [];
            if (this.files && this.files.length > 0) {
                for (var i = 0; i < this.files.length; i++) {
                    promise = this.upload(this.files[i]);
                    promises.push(promise);
                }
            }
            return this.$q.all(promises);
        }

        calcSha1(file: any) {
            this.uploadService.dataUrl(file, true)
                .then((url: string) => {
                    var meta = url.substr(0, 30);
                    this.$log.info("meta: " + meta);
                    var sha1 = this.sha1Service.hash(url.substr(url.indexOf(',') + 1));
                    this.$log.info("sha1 1: " + sha1);
                });
        }

        upload(file: any) {
            var deferred: any = this.$q.defer();
            this.uploadService.dataUrl(file, true)
                .then((url: string) => {
                    var sha1 = this.sha1Service.hash(url.substr(url.indexOf(',') + 1));
                    this.item.uploadHashs.push(sha1);
                    return this.uploadService.http({
                        url: this.apiUrlEndpoint + '/media/' + sha1 + '?client=web',
                        method: 'PUT',
                        headers: {
                            'Content-Type': file.type
                        },
                        data: file
                    });
                })
                .then((resp: any) => {
                    this.$log.info('Success ');
                    deferred.resolve(resp);
                })
                .catch((error: any) => {
                    this.$log.error(error);
                    deferred.reject(error.data);
                });

            return deferred.promise;
        }
    }
}
