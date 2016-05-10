module itweet.model {
    export class Tweet {
        deviceId: string;
        lat: number = 0;
        lng: number = 0;
        latDevice: number = 2;
        lngDevice: number = 2;
        eleDevice: number;
        hAccuracy: number;
        manual: number;
        langISO: string;
        countryISO: string;
        address: string;
        location: string;
        refItemCategoryId: number;
        txt: string;
        mail: string;
        name: string;
        fon: string;
        uploadHashs: string[] = [];
        loginToken: string;
        contextToken: string;
        guid: string;
        
        sent: boolean;
        save: boolean;
        dateAdded: number;
        
        public mediaStore: { [index: string]: MediaStorageElement; } = {};

        static prepareForTransmission(tweet: Tweet, config: BaseConfig, user: User) {
            Tweet.updateWithConfig(tweet, config, user);
            var copy = angular.copy(tweet);
            delete copy.mediaStore;
            delete copy.sent;
            delete copy.save;
            delete copy.dateAdded;
            return copy;
        }
        static getCurrentContextToken(tweet: Tweet, user: User): string {
            if (user.showContext || !user.token) {
                return tweet.contextToken;
            } else {
                return user.token
            }
        }
        static updateWithConfig(tweet: Tweet, config: BaseConfig, user: User) {
            tweet.deviceId = user.deviceid;
            tweet.langISO = config.langISO;
            tweet.countryISO = config.countryISO;
            tweet.loginToken = user.token;
            tweet.guid = tweet.guid || StorageService.guid();
            /* TODO: EMPTY NAME; WHY THE PROBLEM ?? */
            tweet.name = user.name || user.email;
            tweet.mail = user.email || "";
            tweet.fon = user.tel || "";
            if (!tweet.mediaStore) {
                tweet.mediaStore = {};
            }
            tweet.uploadHashs = Object.keys(tweet.mediaStore).map((key) => { return tweet.mediaStore[key].sha1 });
            //Object.defineProperty(tweet, 'guid', { value: tweet.guid, enumerable: false });

        }
    }
    export class User {
        public token: string;
        public email: string;
        public name: string;
        public tel: string;
        public createMessageAllowed: boolean = true;
        public showContext: boolean = true;
        public mapType: string;
        public deviceid: string;
        
    }
    
}