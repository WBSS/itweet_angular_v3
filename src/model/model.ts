module itweet.model {
    export interface MediaStorageElement {
        sha1: string;
        url: string;
        mime: string;
    }
    export interface CategoriesResponse {
        categories: Category[]
        displayName: string
    }
    export interface BrandResponse {
        categorySelectorColor: string
        footerButtonColor: string
        footerButtonColorText: string
        subheaderColor: string
        subheaderColorText: string
        urlIconLogo: string
    }
    export interface LoginResponse {
        createMessageAllowed: boolean
        loginToken: string
        showContext: boolean
    }
    export class Category {
        id: number;
        name: string;
    }

    export class Context {
        contextToken: string;
        displayname: string;
        urlIconContext: string;
        categories: any = {};
    }   
}

