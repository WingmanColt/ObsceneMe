import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { debounceTime, switchMap, Observable, Subject, BehaviorSubject, of } from "rxjs";
import { WebApiUrls } from "src/app/configs/webApiUrls";
import { KeywordsArray, SearchRequest } from "src/app/shared/classes/search";
import { environment } from "environments/environment";
import { LocalStorageService } from "../LocalStorage/local-storage.service"; // Assuming path

@Injectable({
    providedIn: "root",
})
export class SearchService {

    private searchSettings = environment.searchSettings;

    private _searchData$ = new Subject<SearchRequest>();
    private _searchDataSimple$ = new Subject<string>();
    private _responseSource = new Subject<any>();
    private _keywordsCache: BehaviorSubject<KeywordsArray[]> = new BehaviorSubject<KeywordsArray[]>([]);
    
    public _searchSimple: Observable<any> = this._searchDataSimple$.asObservable();
    public _searchResponse: Observable<any> = this._responseSource.asObservable();

    private _cache = {
        keywords: [],
    };

    constructor(private http: HttpClient, private config: WebApiUrls, private localStorageService: LocalStorageService) {
        this.initializeCache();
    }

    private async initializeCache() {
        const keywords = await this.localStorageService.get("keywords");
        if (typeof keywords === 'string') {
            // If 'keywords' is a string, parse it as JSON
            try {
                const parsedKeywords = JSON.parse(keywords);
                this._keywordsCache.next(parsedKeywords);
            } catch (e) {
                console.error("Error parsing keywords JSON data:", e);
            }
        } else if (Array.isArray(keywords) && keywords.length > 0) {
            // If 'keywords' is already an array, use it directly

            this._keywordsCache.next(keywords);
        } 
    }
    

    private async updateCache(key: string, value: any) {
        if (key === "keywords" && !Array.isArray(value)) {
            console.error("Trying to set a non-array value to keywords:", value);
            return;
        }
        this._cache[key] = value;
        this._keywordsCache.next(this._cache[key]);

        await this.localStorageService.set(key, JSON.stringify(value));
    }

    private liveSearchInternal(requestModel: any, subject: Subject<SearchRequest>): Observable<any> {
        return subject.pipe(
            debounceTime(500),
            switchMap(() => {
                // Check if requestModel is empty or null
                if (!requestModel || !requestModel.searchString) {
                    // Return an empty observable if the request model is not valid
                    return of([]); // or any suitable default value
                }
                // Proceed with the HTTP call if the request model is valid
                return this.http.put<any>(this.config.setting["GetSearchResults"], requestModel);
            })
        );
    }
    

    public liveSearch(requestModel: any): Observable<any> {
        return this.liveSearchInternal(requestModel, this._searchData$);
    }


    public updateSearch(val: any) {
        this._searchData$.next(val);
    }

    public updateSearchSimple(val: any) {
        this._searchDataSimple$.next(val);
    }
    public getKeywordsState(): Observable<KeywordsArray[]> {
        return this._keywordsCache.asObservable();
    }

    public async updateLastSearchedWord(searchState: KeywordsArray): Promise<boolean> {
        const stateItems = this._cache.keywords;
        const entity = stateItems.find((ent) => ent.keyword === searchState.keyword);

        if (stateItems.length >= this.searchSettings.lastSearchedWordsCount) {
            await this.removeKeyword(entity);
        }

        const val = {
            keyword: searchState.keyword,
            type: searchState.type,
            catId: searchState.catId,
        };

        if (!entity && searchState.keyword) {
            stateItems.push(val);
            await this.updateCache("keywords", stateItems);
        }

        return true;
    }

    public async removeKeyword(entity: any): Promise<boolean> {
        // If entity is falsy (null or undefined), return false indicating removal failure
        if (!entity) return false;
    
        // Find the index of the entity within the cache.keywords array
        const index = this._cache.keywords.indexOf(entity);
        
        // If the index is found, remove the entity from the cache.keywords array
        if (index > -1) {
            this._cache.keywords.splice(index, 1);
        }
    
        // Update the cache with the modified keywords array
        await this.updateCache("keywords", this._cache.keywords);
        // Return true to indicate successful removal
        return true;
    }

    setResponse(value: any) {
        this._responseSource.next(value);
    }

    getResponse(): Observable<any> {
        return this._searchResponse;
    }
    
}
