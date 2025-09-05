import { Component, EventEmitter, OnDestroy, OnInit, Output, Renderer2, RendererFactory2 } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "environments/environment";
import { UntypedFormGroup, UntypedFormBuilder, Validators } from "@angular/forms";
import { SearchService } from "src/app/Services/Search/search.service";
import { Observable, Subject, debounceTime, map, takeUntil } from "rxjs";
import { KeywordsArray, SearchRequest, SearchResponse, SearchType } from "../../classes/search";
import { ProductsService } from "src/app/Services/Product/products.service";
import { TranslateService } from "@ngx-translate/core";
import { BaseService } from "src/app/Services/base.service";
import { BreakpointDetectorService } from "src/app/Services/Devices/breakpoint-detector.service";
import { ProductFilterService } from "src/app/Services/Product/filters.service";

@Component({
  selector: "app-searchbar",
  templateUrl: "./searchbar.component.html",
  styleUrls: ["./searchbar.component.scss"],
})
export class SearchBarComponent implements OnInit, OnDestroy {
  @Output() isOpen = new EventEmitter<boolean>();

  componentName: string = "SearchBarComponent";
  settings = environment.searchSettings;

  isLoading: boolean = false;
  isSearchOpen: boolean = false;

  hasValue = false;
  searchType = SearchType;
  renderer: Renderer2;

  searchForm: UntypedFormGroup;
  searchResults$: Observable<any>;
  relatedProducts$: Observable<any>;
  lastSearchedWords$: Observable<any>;
  isMobile: boolean;

  private destroy$ = new Subject<void>(); // Subject for managing component destruction
  private searchTimeout: any = null; // Stores the timeout reference
  private debounceTime = 1000; // Delay in milliseconds

  req: SearchRequest = {
    searchString: "",
    searchType: SearchType.Product,
    usedLanguage: 'en',
  };

  constructor(
    public baseService: BaseService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private translate: TranslateService,
    private searchService: SearchService,
    private productsService: ProductsService,
    private filterService: ProductFilterService,
    private rendererFactory: RendererFactory2,
    private device: BreakpointDetectorService,
    private fb: UntypedFormBuilder
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);
    this.buildForm();
  }
  ngOnInit(): void {
    this.isMobile = this.device.isDevice("Mobile");

    this.initSubscriptions();
  }

  ngOnDestroy(): void {
    this.closeSearchBar();

    this.destroy$.next();
    this.destroy$.complete();
}


  private initSubscriptions(): void {
    this.searchResults$ = this.initSearchResultsObservable();
    this.lastSearchedWords$ = this.searchService.getKeywordsState();

    if(this.settings.showAdProductsMobile || this.settings.showAdProductsDesktop)
    this.relatedProducts$ = this.productsService.getRelatedProducts(3);

     this.baseService.menuState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(menuState => {
        this.isSearchOpen = menuState.isSearchOpen;

        if (this.settings.showOverlay) 
          this.toggleOverlay(menuState.isSearchOpen);
      });
  }

  private initSearchResultsObservable(): Observable<any> {
    return (this.searchResults$ = this.searchService.liveSearch(this.req).pipe(
      takeUntil(this.destroy$),
      map((response: SearchResponse) => {
        this.isLoading = false;
        
        if (this.settings.showLastSearchedWord) {
          if (response.products && response.products?.length > 0) {
            this.searchService.updateLastSearchedWord(new KeywordsArray(response.products[0].title, this.searchType.Product, undefined));
          }
          if (response.categories && response.categories?.length > 0) {
            this.searchService.updateLastSearchedWord(new KeywordsArray(response.categories[0].title, this.searchType.Category, response.categories[0].id));
          }
        }
        return response;
      })
    ));
  }
  private buildForm(): void {
    this.searchForm = this.fb.group({
      searchString: ["", [Validators.required]],
    });
  }

 onSubmit(url: string | undefined, searchType: SearchType, catId: number | undefined): void {
    let queryParams: any = {};

    switch (searchType) {
        case SearchType.Product:
            queryParams.searchString = url !== undefined && url.trim() !== '' ? url : this.req.searchString;
            break;

        case SearchType.Category:
            if (catId !== undefined) {
                queryParams.subCategoryId = catId;
            }
            break;

        case SearchType.Page:
            if (url) {
                const urlParams = new URLSearchParams(url);
                urlParams.forEach((value, key) => {
                    queryParams[key] = value;
                });
            }
            break;
    }

    const navigateUrl = '/shop'; // Always route to the shop or main search page

    this.router.navigate([navigateUrl], {
        relativeTo: this.activatedRoute,
        queryParams: queryParams,
        replaceUrl: true
    });
}




  searchBarToggle(): boolean {
    this.isSearchOpen = !this.isSearchOpen;
    this.baseService.updateMenuState({ isSearchOpen: this.isSearchOpen });

    if (this.isSearchOpen == true) {
      this.searchService.updateSearch(this.req);
    }

    if (this.settings.showOverlay) 
      this.toggleOverlay(this.isSearchOpen);

    return this.isSearchOpen;
  }

  closeSearchBar(): void {
    this.isSearchOpen = false;
    this.baseService.updateMenuState({ isSearchOpen: false });

    if (this.settings.showOverlay)
        this.toggleOverlay(false);
}

  private toggleOverlay(set: boolean): void {
    const overflowValue = set ? "hidden" : ""
    this.renderer.setStyle(document.documentElement, "overflow", overflowValue);
  }


  close(): boolean {
    if (this.isSearchOpen == true) {
      
      if (!this.req.searchString?.length) {

        this.isSearchOpen = false;
        this.baseService.updateMenuState({ isSearchOpen: false });

        if (this.settings.showOverlay)
          this.toggleOverlay(false);

        return this.isSearchOpen;
      }

      this.req.searchString = "";
     // this.updateObservables();
    }

    return true;
  }

  searchRequest(value: string): void {
    this.hasValue = !!value;

    if (!value) 
    {
    this.req.searchString = "";
    this.updateObservables();
    return;
    }

    this.req.searchString = value;
    this.req.usedLanguage = this.translate.store.currentLang;
    this.isLoading = true;

    clearTimeout(this.searchTimeout); // Clear the existing timeout

    this.searchTimeout = setTimeout(() => {
      if (!this.searchResults$)
        this.searchResults$ = this.initSearchResultsObservable(); // Ensure this method exists and is implemented

       this.updateObservables();
    }, this.debounceTime);
  }

  async removeWord(ent: string): Promise<void> {
    await this.searchService.removeKeyword(ent);
  }

  updateObservables(): void {
    this.searchService.updateSearch(this.req);
    this.searchService.updateSearchSimple(this.req.searchString);
    this.filterService.updateFilter('searchString', this.req.searchString)

  }
}
