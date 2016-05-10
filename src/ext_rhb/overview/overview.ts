module itweet.overview {

    export class RHBOverviewController extends OverviewController {

        validateTweet(currentTweet){
            if (this.isCatergoryIeadsProposal()) {
                if (currentTweet.txt) {
                    return true;
                }
                return false;
            }
            else
            {
                if (currentTweet.txt
                    && (currentTweet.itemQs.refLocationId || currentTweet.itemQs.refTrackId || currentTweet.itemQs.trackPosition)
                    && currentTweet.refItemCategoryId){
                    //&& (currentTweet.itemQs.refTrainId || currentTweet.itemQs.refWagonId)) {
                    return true;
                }
                return false;
            }
        }

        isCatergoryIeadsProposal() {if(this.$scope.storageService.currentTweet.refItemCategoryId==this.config.CATEGORY_IDEAS_PROPOSAL) return true; else return false;}
        
        gotoDetail(destination:string){
        	if(destination === 'app.category'){
        		this.$scope.storageService.currentTweet.itemQs.refItemCategoryQsId = null;
        	}
	       super.gotoDetail(destination);
        }
    }
}