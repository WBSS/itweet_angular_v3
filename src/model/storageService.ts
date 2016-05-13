module  itweet.model {
    export class StorageService {
        public static mimeTypeFromExt = {
            jpg: "image/jpeg",
            wav: "audio/wav",
            aac: "audio/aac"
        }

        public static $inject = [
            '$localStorage', 'ItweetConfig', '$q','$log'
        ];

        public user:User;
        public currentTweet:Tweet;
        public contextStore;
        public brandStore;
        public metdataStore;
        public initial = true;
        public allTweets: { [index: string]: Tweet; }
        public resetable = [];

        constructor(private $localStorage, private ItweetConfig, private $q:angular.IQService,private $log:angular.ILogService) {
            this.user = $localStorage.user || new User();
            this.currentTweet =  new Tweet();
            this.contextStore = $localStorage.contextStore || {};
            this.brandStore = $localStorage.brandStore || {};
            this.allTweets = $localStorage.allTweets || {};
            this.metdataStore = $localStorage.metadata || {};
            if(!this.user.deviceid){
                this.user.deviceid = StorageService.guid();
            }

            $localStorage.user = this.user;
            $localStorage.allTweets = this.allTweets;
            $localStorage.metadata =  this.metdataStore;
            $localStorage.currentTweet = this.currentTweet;
            $localStorage.contextStore = this.contextStore;
            $localStorage.brandStore = this.brandStore;
            Tweet.updateWithConfig(this.currentTweet, ItweetConfig, this.user);
       
            
            this.cleanupFiles();
        }



        shouldDismissRegister():boolean {
            var resp = false;
            if (this.initial && this.hasRegistered()) {
                resp = true;
                this.initial = false; //initial muss immer zurück gesetzt werden
            }
            return resp;
        }

        hasRegistered(): boolean {
            return (this.user.email != undefined || this.user["userID"] != undefined);
        }


        /* MEDIA MANAGEMENT */
        setImage(index:number, url:any) {
            this.setItweetMediaElement(index + 1, url);
        }

        images():string[] {
            return [1, 2, 3].map((elem) => {
                return this.currentTweet.mediaStore[elem] ? this.currentTweet.mediaStore[elem].url : undefined
            });
        }

        getAudio() {
            var elem:MediaStorageElement = this.currentTweet.mediaStore[0];
            return elem ? elem.url : undefined;
        }

        deleteHash(realindex) {
            return new this.$q((resolve, reject) => {
                if (this.currentTweet.mediaStore[realindex]) {
                    var media = this.currentTweet.mediaStore[realindex];
                    window.resolveLocalFileSystemURL(media.url, (fileEntry) => {
                        fileEntry.remove();
                        resolve();
                    }, reject);
                    delete this.currentTweet.mediaStore[realindex];
                } else {
                    resolve();
                }
            })
        }


        private setItweetMediaElement(realindex, url) {
            this.deleteHash(realindex);
            if (url) {
                var hash = StorageService.hashFromUrl(url);
                var ext = StorageService.extFromUrl(url);
                var mime = StorageService.mimeTypeFromExt[ext];
                this.currentTweet.mediaStore[realindex] = <MediaStorageElement>{url: url, sha1: hash, mime: mime}
            }
        }

        setAudio(url) {
            this.setItweetMediaElement(0, url);
        }

        static  extFromUrl(url) {
            return (url = url.substr(1 + url.lastIndexOf("/")).split('?')[0]).split(".")[1];
        }

        static hashFromUrl(url) {
            return (url = url.substr(1 + url.lastIndexOf("/")).split('?')[0]).split(".")[0];
        }

        // TWEET MANAGEMENT //
        newTweet() {
            this.currentTweet = new Tweet();
            Tweet.updateWithConfig(this.currentTweet, this.ItweetConfig, this.user);
        }
        deleteTweet(tweet:Tweet){
            delete this.allTweets[tweet.guid];
        }
        saveTweet(tweet:Tweet){
            tweet.save = true;
            tweet.dateAdded = new Date().getTime();
            this.allTweets[tweet.guid] = angular.copy(tweet);
        }

        hasTweetsSaved(){
            var resp =  Object.keys(this.allTweets).length > 0;
            //this.$log.debug("items in store: " + resp);
            return resp;
        }

        clearCache(){
            angular.copy({},this.brandStore);
            angular.copy({},this.contextStore);
            this.resetable.forEach((elem ) => {elem.reset()});
        }

        cleanupFiles(){
            /* NO SUPPORT IN BROWSER */
            if (typeof(LocalFileSystem) === 'undefined') {
                return;
            }
            var allHash = {};
            Object.keys(this.allTweets).forEach((key) => {
                var tweet = this.allTweets[key];
                Object.keys(tweet.mediaStore).forEach((mediakey) => {
                    var element = tweet.mediaStore[mediakey];
                    allHash[element.sha1] = true;
                });
            });

            new this.$q((resolve,reject) => {
                window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, (fileSystem) => {
                    fileSystem.root.getDirectory(this.ItweetConfig.assets_storage_folder, {
                        create: true
                    }, (directory)  => {
                        var directoryReader = directory.createReader();
                        directoryReader.readEntries((entries) => {
                            entries.forEach((entry) => {
                                var hash = StorageService.hashFromUrl(entry.nativeURL);
                                if(allHash[hash]){
                                    this.$log.debug("keep" + entry);
                                } else {
                                    this.$log.debug("remove" + entry);
                                    entry.remove(()=>{this.$log.debug("remove done)" + entry);},(error)=>{
                                        this.$log.error("remove failed)" + entry +" "+  error);
                                    });
                                }
                            });
                            resolve();
                        }, function (error) {
                            reject(error);
                        });

                    } );
                }, function(error) {
                    reject(error);
                });
            })
        }

        static guid() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        }

    }

    angular.module("itweet.storage", ['ngStorage']).service("ItweetStorage", StorageService);
}