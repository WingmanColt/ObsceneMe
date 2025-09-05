import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { AccountService } from 'src/app/Services/Account/account.service';
import { BreakpointDetectorService } from 'src/app/Services/Devices/breakpoint-detector.service';
import { AuthResponse } from 'src/app/shared/classes/account';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrl: './user-info.component.scss'
})
export class UserInfoComponent implements OnInit, OnDestroy{
  outputMessage: string;
  activeTab: string = 'contact-info';
  isMobile: boolean;

  tabs = [
    { label: 'Dashboard', value: 'dashboard', showForAffiliate: true },
    { label: 'Settings', value: 'contact-info' },
    { label: 'History with your orders', value: 'orders-history' },
    { label: 'Favorites list', value: 'wish-list' },
    { label: 'Payments', value: 'payments', showForAffiliate: true },
    { label: 'Guide', value: 'guide', showForAffiliate: true },
  ];

  currentUser: AuthResponse | undefined;
  private destroy$ = new Subject<void>();
  
  constructor(
    private router: Router,
    private accountService: AccountService,
    private deviceDetector: BreakpointDetectorService) {
  }

  ngOnInit(): void {
    this.initSubscriptions();
    this.isMobile = this.deviceDetector.isDevice("Mobile");
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initSubscriptions() {
    this.accountService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUser = user ?? undefined;
   });
  }

changeTab(tab: string): void {
  if (this.activeTab !== tab) {
    this.activeTab = tab;
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth' // you can use 'auto' if you want instant scroll
    });
  }
}


get filteredTabs() {
  const isAffiliate = this.currentUser?.user?.isAffiliate;

  return this.tabs.filter(tab => {
    if (tab.hasOwnProperty('showForAffiliate')) {
      return isAffiliate === true;
    }
    return true;
  });
}
  async logout() {
    await this.accountService.logout().then(() => {
      this.router.navigate(["/"]);
      return;
    });
  }

}
