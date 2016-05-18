module itweetWeb {
    'use strict';

    // global var
    declare var rhb;

    export class ItemService {
        public apiUrl: string;
        public apiUrlEndpoint: string;
        public items: itweetWeb.model.Item[];
        public statistics: itweetWeb.model.Statistics;
        public loading: boolean = false;
        public refItemStatuses: itweetWeb.model.RefItemStatus[];
        public refItemVisibilities: itweetWeb.model.RefItemVisibility[];
        public refItemCategories: itweetWeb.model.RefItemCategory[];
        public itemFilter: itweetWeb.model.ItemFilter = new itweetWeb.model.ItemFilter();
        public totalResults: number;
        public totalPages: number;
        public metadata: itweetWeb.model.Metadata;
        public page: number = 0;
        public locations = [];
        public tracks = [];
        public trains = [];
        public wagons = [];
        public persons = [];
        public ranges: any;
        public years: any;
        public categoriesQs = [];

        private $log: ng.ILogService;
        private $http: ng.IHttpService;
        private $q: ng.IQService;
        private userService: UserService;
        private initDone: boolean = false;

        /** @ngInject */
        constructor($log: ng.ILogService, $http: ng.IHttpService, $q: ng.IQService, userService: UserService) {
            this.$log = $log;
            this.$http = $http;
            this.$q = $q;
            this.userService = userService;
            this.apiUrl = rhb.config.apiUrl;
            this.apiUrlEndpoint = rhb.config.apiUrlEndpoint;

        }

        initLists(): ng.IPromise<any> {
            var deferred: any = this.$q.defer();

            if (this.initDone) {
                deferred.resolve();

            } else {
                this.userService.getContextToken()
                    .then(() => {
                        return this.getMetadata();
                    })
                    .then((metadata: itweetWeb.model.Metadata) => {
                        this.metadata = metadata;
                        return this.getRefItemStatuses();
                    })
                    .then((statuses: itweetWeb.model.RefItemStatus[]) => {
                        this.refItemStatuses = statuses;
                        return this.getRefItemVisibilites();
                    })
                    .then((visibilities: itweetWeb.model.RefItemVisibility[]) => {
                        this.refItemVisibilities = visibilities;
                        return this.getYears();
                    })
                    .then((years: number[]) => {
                        this.years = years;
                        return this.getRanges();
                    })
                    .then((ranges: number[]) => {
                        this.ranges = ranges;
                        return this.getRefItemCategories();
                    })
                    .then((categories: itweetWeb.model.RefItemCategory[]) => {
                        this.refItemCategories = categories;
                        this.buildAutocompletes();
                        this.initDone = true;
                        deferred.resolve();
                    })
                    .catch((error: any) => {
                        this.$log.error(error);
                        deferred.reject(error);
                    });
            }

            return deferred.promise;
        }

        buildAutocompletes() {

            this.$log.info('itemService: buildAutocompletes()');

            var i: number;
            var newLocation, newTrack, newTrain, newWagon, newPerson: any;

            // Location
            for (i = 0; i < this.metadata.locations.length; i++) {
                newLocation = {
                    id: this.metadata.locations[i].id,
                    display: this.metadata.locations[i].name,
                    query: this.metadata.locations[i].name.toLowerCase()
                };
                this.locations.push(newLocation);
            }

            // Track
            for (i = 0; i < this.metadata.tracks.length; i++) {
                newTrack = {
                    id: this.metadata.tracks[i].id,
                    display: this.metadata.tracks[i].name,
                    query: this.metadata.tracks[i].name.toLowerCase()
                };
                this.tracks.push(newTrack);
            }

            // Train
            for (i = 0; i < this.metadata.trains.length; i++) {
                newTrain = {
                    id: this.metadata.trains[i].id,
                    display: this.metadata.trains[i].trainNr + " - " + this.metadata.trains[i].carrier + " - " + this.metadata.trains[i].route,
                    query: this.metadata.trains[i].trainNr
                };
                this.trains.push(newTrain);
            }

            // Wagon
            for (i = 0; i < this.metadata.wagons.length; i++) {
                newWagon = {
                    id: this.metadata.wagons[i].id,
                    display: this.metadata.wagons[i].wagonNr + " - " + this.metadata.wagons[i].objectName,
                    query: this.metadata.wagons[i].wagonNr
                };
                this.wagons.push(newWagon);
            }

            // Person
            for (i = 0; i < this.metadata.persons.length; i++) {
                newPerson = {
                    id: this.metadata.persons[i].id,
                    firstName: this.metadata.persons[i].firstName,
                    lastName: this.metadata.persons[i].lastName,
                    department: this.metadata.persons[i].department,
                    display: this.metadata.persons[i].id + ", " + this.metadata.persons[i].firstName + " " + this.metadata.persons[i].lastName + ", " + this.metadata.persons[i].department,
                    query: this.metadata.persons[i].firstName.toLowerCase() + " " + this.metadata.persons[i].lastName.toLowerCase(),
                    queryReverse: this.metadata.persons[i].lastName.toLowerCase() + " " + this.metadata.persons[i].firstName.toLowerCase()
                };
                this.persons.push(newPerson);
            }

            // CategoryQs
            this.addCategoryQsParents();
            for (i = 0; i < this.metadata.categoriesQs.length; i++) {
                this.addCategoryQs(this.metadata.categoriesQs[i]);
            }
            this.categoriesQs.sort((a: any, b: any) => {
                return a.display.localeCompare(b.display);
            });
        }

        addCategoryQs(categoryQs: itweetWeb.model.RefItemCategoryQs) {
            var newCategoryQs = {
                id: categoryQs.id,
                display: this.getCategoryQsDisplay(categoryQs),
                query: categoryQs.name.toLowerCase()
            };
            this.categoriesQs.push(newCategoryQs);
        }

        getCategoryQsDisplay(categoryQs: itweetWeb.model.RefItemCategoryQs) {
            var categoryQsDisplay: string = "";

            if (categoryQs.parent === null) {
                categoryQsDisplay = categoryQs.name;
            } else {
                if (categoryQs.parent.parent === null) {
                    categoryQsDisplay = categoryQs.parent.name + " :: " + categoryQs.name;
                } else {
                    categoryQsDisplay = categoryQs.parent.parent.name + " :: " + categoryQs.parent.name + " :: " + categoryQs.name;
                }
            }
            return categoryQsDisplay;
        }

        addCategoryQsParents() {
            for (var i = 0; i < this.metadata.categoriesQs.length; i++) {
                this.metadata.categoriesQs[i].parent = this.getCategoryQsById(this.metadata.categoriesQs[i].parentId);
            }
        }

        getCategoryQsById(id: number): itweetWeb.model.RefItemCategoryQs {
            if (!id) return null;
            for (var i = 0; i < this.metadata.categoriesQs.length; i++) {
                if (this.metadata.categoriesQs[i].id === id) {
                    return this.metadata.categoriesQs[i];
                }
            }
        }

        querySearch(type: string, query: string, list: any) {
            var results;
            if (type === "person") {
                results = list.filter(this.createFilterForPerson(query));
            } else {
                results = list.filter(this.createFilterFor(query));
            }
            return results.slice(0, 12);
        }

        createFilterFor(input: string) {
            var query = input.toLowerCase();
            return function filterFn(item: any) {
                var i = (item.query.indexOf(query) === 0);
                return i;
            };
        }

        createFilterForPerson(input: string) {
            var query = input.toLowerCase();
            return function filterFn(person: any) {
                var i = (person.id.indexOf(query) === 0);
                if (i) {
                    return i;
                } else {
                    i = (person.query.indexOf(query) === 0);
                }
                if (i) {
                    return i;
                } else {
                    i = (person.queryReverse.indexOf(query) === 0);
                }
                return i;
            };
        }

        getCategoryTree(item: itweetWeb.model.Item): string {
            var categoryTree: string = "";

            if (!item) {
                return;
            }

            categoryTree += item.refItemCategory.nameTranslated;
            if (item.itemQs.refItemCategoryQs1 !== undefined) {
                categoryTree += " | " + item.itemQs.refItemCategoryQs1.name;
            }
            if (item.itemQs.refItemCategoryQs2 !== undefined) {
                categoryTree += " | " + item.itemQs.refItemCategoryQs2.name;
            }
            if (item.itemQs.refItemCategoryQs3 !== undefined) {
                categoryTree += " | " + item.itemQs.refItemCategoryQs3.name;
            }

            return categoryTree;
        }

        getLocationFull(item: itweetWeb.model.Item): string {
            var location: string = "";

            if (!item) {
                return;
            }

            if (item.itemQs.refLocation !== undefined) {
                location += item.itemQs.refLocation.name;
            }
            if (item.itemQs.refTrack !== undefined) {
                if (location.length > 0) location += " | ";
                location += item.itemQs.refTrack.name;
            }
            if (item.itemQs.trackPosition !== undefined) {
                if (location.length > 0) location += " | ";
                location += item.itemQs.trackPosition;
            }

            if (location.length === 0) {
                // Old implementation
                location = item.location;
            }

            return location;
        }

        getTrainFull(item: itweetWeb.model.Item): string {

            if (!item || item.itemQs.refTrain === undefined) {
                return;
            }

            var trainFull: string = "";
            var itemQs = item.itemQs;

            trainFull += itemQs.refTrain.trainNr + " " + itemQs.refTrain.route + " (" + itemQs.refTrain.carrier + ")";

            return trainFull;
        }

        getWagonFull(item: itweetWeb.model.Item): string {

            if (!item || item.itemQs.refWagon === undefined) {
                return;
            }

            var wagonFull: string = "";
            var itemQs = item.itemQs;

            wagonFull += itemQs.refWagon.objectName + " " + itemQs.refWagon.name;

            return wagonFull;
        }

        getPersonFull(refPerson: itweetWeb.model.RefPerson): string {
            if (!refPerson) {
                return null;
            }
            return refPerson.id + " " + refPerson.firstName + " " + refPerson.lastName + ", " + refPerson.department;
        }

        getImagePath(upload: itweetWeb.model.Upload, type: string): string {

            if (!upload)
                return null;

            if (type === "sta") {
                return this.apiUrl + "/media/images/img_" + upload.id + "_" + type + ".jpg?sha1=" + upload.sha1;
            } else {
                return this.apiUrl + "/media/images/img_" + upload.id + "_" + type + ".jpg";
            }
        }

        getVoicePath(upload: itweetWeb.model.Upload, type: string): string {

            if (!upload)
                return null;

            return this.apiUrl + "/media/voices/voi_" + upload.id + "_" + type + ".aac?sha1=" + upload.sha1;
        }

        getImageUploads(uploads: itweetWeb.model.Upload[]): itweetWeb.model.Upload[] {

            if (!uploads) {
                return null;
            }

            var imageUploads: itweetWeb.model.Upload[] = [];

            for (var i = 0; i < uploads.length; i++) {
                if (uploads[i].fileContentType === "I")
                    imageUploads.push(uploads[i]);
            }

            return imageUploads;
        }

        getFirstImageUpload(uploads: itweetWeb.model.Upload[]): itweetWeb.model.Upload {
            if (!uploads)
                return null;

            for (var i = 0; i < uploads.length; i++) {
                if (uploads[i].fileContentType === "I")
                    return uploads[i];
            }

            return null;
        }

        getVoiceUpload(uploads: itweetWeb.model.Upload[]): itweetWeb.model.Upload {
            if (!uploads)
                return null;

            for (var i = 0; i < uploads.length; i++) {
                if (uploads[i].fileContentType === "V")
                    return uploads[i];
            }

            return null;
        }

        getItemStatusColor(item: itweetWeb.model.Item): string {

            if (!item) {
                return null;
            }

            var color: string = "";
            var refItemStatusId = item.refItemStatus.id;

            if (refItemStatusId === 1) {
                color = "#ef3e36";
            } else if (refItemStatusId === 4) {
                color = "#f8b213";
            } else if (refItemStatusId === 2) {
                color = "#99cc33";
            } else if (refItemStatusId === 3) {
                color = "#d4d9db";
            }
            return color;
        }

        getItems(): ng.IPromise<any> {
            var defer = this.$q.defer();
            if (this.items) {
                this.$log.debug("getItems from cache");
                defer.resolve(this.items);
                return defer.promise;
            } else {
                this.$log.debug("getItems from http");
                this.loading = true;
                return this.getItemsHttp();
            }
        }

        reload() {
            this.clearCache();
            this.getItems();
        }

        clearCache() {
            this.loading = false;
            this.$log.debug("clearCache");
            if (this.items !== undefined)
                this.items = undefined;
            this.page = 0;
        }

        nextPage() {
            if (this.loading)
                return;

            if (this.page === this.totalPages)
                return;

            this.$log.debug("Next page: " + this.page);
            this.loading = true;
            this.getItemsHttp();
        }

        getRefItemCategories(): ng.IPromise<any> {
            var defer = this.$q.defer();
            if (this.refItemCategories !== undefined) {
                this.$log.debug("RefItemCategories from cache");
                defer.resolve(this.refItemCategories);
                return defer.promise;
            } else {
                this.loading = true;
                return this.getRefItemCategoriesHttp();
            }
        }

        getMetadata(): ng.IPromise<any> {
            var defer = this.$q.defer();
            if (this.metadata) {
                this.$log.debug("Metadata from cache");
                defer.resolve(this.metadata);
                return defer.promise;
            } else {
                this.loading = true;
                return this.getMetadataHttp();
            }
        }

        getRefItemStatuses(): ng.IPromise<any> {
            var refItemStatus: itweetWeb.model.RefItemStatus;
            var defer = this.$q.defer();
            if (!this.refItemStatuses) {
                this.refItemStatuses = [];
                refItemStatus = new itweetWeb.model.RefItemStatus();
                refItemStatus.id = 1;
                refItemStatus.nameTranslated = "Neu";
                this.refItemStatuses.push(refItemStatus);

                refItemStatus = new itweetWeb.model.RefItemStatus();
                refItemStatus.id = 4;
                refItemStatus.nameTranslated = "In Arbeit";
                this.refItemStatuses.push(refItemStatus);

                refItemStatus = new itweetWeb.model.RefItemStatus();
                refItemStatus.id = 2;
                refItemStatus.nameTranslated = "Erledigt";
                this.refItemStatuses.push(refItemStatus);

                refItemStatus = new itweetWeb.model.RefItemStatus();
                refItemStatus.id = 3;
                refItemStatus.nameTranslated = "Archiv";
                this.refItemStatuses.push(refItemStatus);
            }
            defer.resolve(this.refItemStatuses);
            return defer.promise;
        }

        getRefItemVisibilites(): ng.IPromise<any> {
            var refItemVisibility: itweetWeb.model.RefItemVisibility;
            var defer = this.$q.defer();
            if (!this.refItemVisibilities) {
                this.refItemVisibilities = [];
                refItemVisibility = new itweetWeb.model.RefItemVisibility();
                refItemVisibility.id = 1;
                refItemVisibility.nameTranslated = "Für alle";
                this.refItemVisibilities.push(refItemVisibility);

                refItemVisibility = new itweetWeb.model.RefItemVisibility();
                refItemVisibility.id = 2;
                refItemVisibility.nameTranslated = "Intern";
                this.refItemVisibilities.push(refItemVisibility);

                refItemVisibility = new itweetWeb.model.RefItemVisibility();
                refItemVisibility.id = 3;
                refItemVisibility.nameTranslated = "Nutzergruppe";
                this.refItemVisibilities.push(refItemVisibility);

                refItemVisibility = new itweetWeb.model.RefItemVisibility();
                refItemVisibility.id = 4;
                refItemVisibility.nameTranslated = "Redigieren";
                this.refItemVisibilities.push(refItemVisibility);
            }
            defer.resolve(this.refItemVisibilities);
            return defer.promise;
        }

        getRanges(): ng.IPromise<any> {
            var range: any;
            var defer = this.$q.defer();
            if (!this.ranges) {
                this.ranges = [];
                range = {};
                range.id = 1;
                range.name = "Quartal 1";
                this.ranges.push(range);

                range = {};
                range.id = 2;
                range.name = "Quartal 2";
                this.ranges.push(range);

                range = {};
                range.id = 3;
                range.name = "Quartal 3";
                this.ranges.push(range);

                range = {};
                range.id = 4;
                range.name = "Quartal 4";
                this.ranges.push(range);

                range = {};
                range.id = 5;
                range.name = "Semester 1";
                this.ranges.push(range);

                range = {};
                range.id = 6;
                range.name = "Semester 2";
                this.ranges.push(range);

                range = {};
                range.id = 7;
                range.name = "Jahr";
                this.ranges.push(range);
            }
            defer.resolve(this.ranges);
            return defer.promise;
        }

        getYears(): ng.IPromise<any> {
            var i: number;
            var year: any;
            var defer = this.$q.defer();
            if (!this.years) {
                this.years = [];
                for (i = 2015; i <= 2020; i++) {
                    year = {};
                    year.id = i;
                    year.name = i;
                    this.years.push(year);
                }
            }
            defer.resolve(this.years);
            return defer.promise;
        }

        getItemsHttp(): ng.IPromise<any> {
            if (this.userService.user.loginToken === undefined)
                return;

            return this.$http.put(this.apiUrlEndpoint + "/item/list/" + this.page + "/de/" + this.userService.user.loginToken, this.itemFilter)
                .then((response: any) => {
                    this.$log.debug(response.data);
                    this.totalResults = response.data.totalResults;
                    this.totalPages = response.data.totalPages;
                    this.$log.debug("Page: " + this.page);
                    if (this.page === 0) {
                        this.items = response.data.items;
                        // Set statistics data
                        this.statistics = new itweetWeb.model.Statistics();
                        this.statistics.categoryQsCountOnItemQs = response.data.categoryQsCountOnItemQs;
                        this.statistics.personCountOnItemQs = response.data.personCountOnItemQs;
                    } else {
                        this.$log.debug("Items: " + this.items);
                        if (this.items === undefined)
                            this.items = [];
                        for (var i = 0; i < response.data.items.length; i++) {
                            this.items.push(response.data.items[i]);
                        }
                    }
                    this.loading = false;
                    this.page++;
                    return this.items;
                })
                .catch((error: any) => {
                    this.$log.error('XHR Failed for getItems.\n', error.data);
                })
                .finally(() => {
                        this.loading = false;
                        this.$log.debug("Loading end");
                    }
                );
        }

        getExport(): ng.IPromise<any> {
            if (this.userService.user.loginToken === undefined)
                return;

            var config: any = {};
            config.responseType = "arraybuffer";
            config.headers = {
                "Accept": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            };

            return this.$http.put(this.apiUrlEndpoint + "/item/list/" + this.page + "/de/" + this.userService.user.loginToken, this.itemFilter, config)
                .then((response: any) => {
                    return response.data;
                })
                .catch((error: any) => {
                    this.$log.error('XHR Failed for getItems.\n', error.data);
                })
                .finally(() => {
                        this.loading = false;
                        this.$log.debug("Loading end");
                    }
                );
        }

        getMetadataHttp(): ng.IPromise<any> {
            return this.$http.get(this.apiUrlEndpoint + "/meta/de/" + this.userService.user.loginToken)
                .then((response: any) => {
                    this.metadata = response.data;
                    return this.metadata;
                })
                .catch((error: any) => {
                    this.$log.error('XHR Failed for Metadata.\n', error.data);
                })
                .finally(() => {
                        this.loading = false;
                        this.$log.debug("Loading end");
                    }
                );
        }

        getItemLogHttp(item: itweetWeb.model.Item): ng.IPromise<any> {

            var config: any = {};
            config.headers = {
                "Cache-control": "private"
            };

            return this.$http.get(this.apiUrlEndpoint + "/log/" + item.id + "/de/" + this.userService.user.loginToken + "?tt=" + new Date().getTime())
                .then((response: any) => {
                    return response.data;
                })
                .catch((error: any) => {
                    this.$log.error('XHR Failed for Log.\n', error.data);
                })
                .finally(() => {
                        this.loading = false;
                        this.$log.debug("Loading end");
                    }
                );
        }

        getRefItemCategoriesHttp(): ng.IPromise<any> {
            return this.$http.get(this.apiUrlEndpoint + "/categories/de/" + this.userService.user.loginToken)
                .then((response: any) => {
                    this.refItemCategories = response.data.categories;
                    return this.refItemCategories;
                })
                .catch((error: any) => {
                    this.$log.error('XHR Failed for getRefItemCategories.\n', error.data);
                })
                .finally(() => {
                        this.loading = false;
                        this.$log.debug("Loading end");
                    }
                );
        }

        getCategoryQsCountOnItem(category: itweetWeb.model.RefItemCategory): number {
            if (!category)
                return 0;

            if (this.statistics.categoryQsCountOnItemQs[category.id]) {
                return this.statistics.categoryQsCountOnItemQs[category.id];
            } else {
                return 0;
            }
        }

        getPersonCountOnItem(person: itweetWeb.model.RefPerson): number {
            if (!person)
                return 0;

            if (this.statistics.personCountOnItemQs[person.id]) {
                return this.statistics.personCountOnItemQs[person.id];
            } else {
                return 0;
            }
        }

        saveResponse(response: itweetWeb.model.Response): ng.IPromise<any> {
            return this.$http.put(this.apiUrlEndpoint + "/item/" + response.item.id + "/response/de/" + this.userService.user.loginToken, response)
                .then((resp: any) => {
                    this.$log.debug("Response saved");
                    return resp.data;
                }, (resp: any) => {
                    this.$log.error("Response failed: ");
                    return resp;
                });
        }

        saveItem(item: itweetWeb.model.Item): ng.IPromise<any> {
            item.loginToken = this.userService.user.loginToken;
            this.setItemRefIds(item);
            var deferred: any = this.$q.defer();
            this.$http.put(this.apiUrlEndpoint + "/item/" + item.guid, item)
                .success((resp: any) => {
                    deferred.resolve(resp);
                })
                .error((resp: any) => {
                    deferred.reject(resp);
                });
            return deferred.promise;
        }

        getItem(itemId: number): ng.IPromise<any> {
            var deferred: any = this.$q.defer();
            this.$http.get(this.apiUrlEndpoint + "/itemById/" + itemId)
                .success((resp: any) => {
                    deferred.resolve(resp);
                })
                .error((resp: any) => {
                    deferred.reject(resp);
                });
            return deferred.promise;
        }

        deleteItem(item: itweetWeb.model.Item): ng.IPromise<any> {
            item.loginToken = this.userService.user.loginToken;
            this.setItemRefIds(item);
            var deferred: any = this.$q.defer();
            this.$http.delete(this.apiUrlEndpoint + "/item/" + item.guid)
                .success((resp: any) => {
                    deferred.resolve(resp);
                })
                .error((resp: any) => {
                    deferred.reject(resp);
                });
            return deferred.promise;
        }

        setItemRefIds(item: itweetWeb.model.Item) {
            if (item.refItemStatus) item.refItemStatusId = item.refItemStatus.id;
            if (item.refItemVisibility) item.refItemVisibilityId = item.refItemVisibility.id;
            if (item.refItemCategory) item.refItemCategoryId = item.refItemCategory.id;
            if (item.itemQs.refPerson) item.itemQs.refPersonId = item.itemQs.refPerson.id;
            if (item.itemQs.refTrain) item.itemQs.refTrainId = item.itemQs.refTrain.id;
            if (item.itemQs.refWagon) item.itemQs.refWagonId = item.itemQs.refWagon.id;
            if (item.itemQs.refLocation) item.itemQs.refLocationId = item.itemQs.refLocation.id;
            if (item.itemQs.refTrack) item.itemQs.refTrackId = item.itemQs.refTrack.id;
            if (item.itemQs.refItemCategoryQs) item.itemQs.refItemCategoryQsId = item.itemQs.refItemCategoryQs.id;
            if (item.itemQs.refRating) item.itemQs.refRatingId = item.itemQs.refRating.id;
            if (item.itemQs.refAssignment) item.itemQs.refAssignmentId = item.itemQs.refAssignment.id;

        }
    }
}
