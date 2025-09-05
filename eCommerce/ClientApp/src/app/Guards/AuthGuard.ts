import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AccountService } from '../Services/Account/account.service';
import { UserAccountModalService } from '../Services/Modal/userAccountModal.service';
import { BaseService } from '../Services/base.service';

export const authGuard: CanActivateFn = async (route, state): Promise<boolean | UrlTree> => {
  const accountService = inject(AccountService);
  const modalService = inject(UserAccountModalService);
  const baseService = inject(BaseService);
  const router = inject(Router);

  const user = await accountService.waitForCurrentUser();

  if (user?.isAuthenticated) {
    return true;
  }

  // ✅ open login modal
 // baseService.updateMenuState({ isUserPanelOpen: true });
  modalService.openModal('LoginPage', false);

  // 🔒 return current URL as UrlTree to cancel navigation
  return router.parseUrl(router.url);  // stays on current page, no blank screen
};
