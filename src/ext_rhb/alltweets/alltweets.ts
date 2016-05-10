module itweet.alltweets {

	export class RHBAlltweetsController extends AlltweetsController {

        //Missplaced
        AllTweetsUrl():string{
            var lat = this.$scope.storageService.currentTweet.latDevice;
            var lng = this.$scope.storageService.currentTweet.lngDevice;
            var token = this.$scope.storageService.user.token || this.$scope.storageService.currentTweet.contextToken;
            var userid = this.$scope.storageService.user.userID;

            var url =     this.ItweetConfig.endpoint_myitems+"/"+this.ItweetConfig.appId+"/"+lat+"/"+lng+"/"+
                this.ItweetConfig.langISO+"/"+this.ItweetConfig.countryISO+"/"+this.ItweetConfig.platform+"/"+userid+"/"+token;

            this.$log.debug( "Tweet URL: "+url);

            return this.$sce.trustAsResourceUrl(url);

        }
    }
}