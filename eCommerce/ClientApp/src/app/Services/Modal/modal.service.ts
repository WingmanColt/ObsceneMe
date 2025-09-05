import { Injectable } from '@angular/core';
import { LocalStorageService } from '../LocalStorage/local-storage.service';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class DiscountModalService {

  isModalActive: number = 0;

  private showModalSource = new Subject<boolean>();
  showDiscountModal$ = this.showModalSource.asObservable();

  constructor(private localStorageService: LocalStorageService) { }

  async setModalState(state: number) {
    await this.localStorageService.set("discount", state);
    this.isModalActive = state;
  }

  async getModalState() {
    const modalState = await this.localStorageService.get("discount");
    this.isModalActive = modalState;
    return this.isModalActive;
  }
  async isAuthModalOpened(): Promise<boolean> {
   return this.localStorageService.get("authModal");
  }

  async openModal() {
    const authOpen = await this.isAuthModalOpened();
    
    if(authOpen !== true)
    this.showModalSource.next(true);
  }

  closeModal() {
    this.showModalSource.next(false);
  }
}

