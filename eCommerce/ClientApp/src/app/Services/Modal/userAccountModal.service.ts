import { Injectable } from '@angular/core';
import { LocalStorageService } from '../LocalStorage/local-storage.service';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class UserAccountModalService {
  isModalActive: number = 0;
  private showModalSource = new Subject<{page:string, withVerification:boolean}>();
  showModal$ = this.showModalSource.asObservable();


  constructor(private localStorageService: LocalStorageService) { }

  async setModalState(state: number) {
    await this.localStorageService.set("authModal", state);
    this.isModalActive = state;
  }

  async getModalState() {
    const modalState = await this.localStorageService.get("authModal");
    this.isModalActive = modalState;
    return this.isModalActive;
  }

  async openModal(page: string, withVerification:boolean) {
    await this.localStorageService.set("authModal", true);
    this.showModalSource.next({page, withVerification});
  }

  async closeModal() {
    await this.localStorageService.set("authModal", false);
    this.showModalSource.next(undefined);
  }
}

