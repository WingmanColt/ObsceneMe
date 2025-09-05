import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { WebApiUrls } from 'src/app/configs/webApiUrls';
import { AuthResponse, User } from 'src/app/shared/classes/account';
import { CookieService } from 'ngx-cookie-service';
import { OperationResult } from 'src/app/shared/interfaces/operationResult';
import { AffiliateUser, PaymentDetails, PerformanceChart } from 'src/app/shared/classes/affiliateUser';

@Injectable({
  providedIn: 'root'
})
export class AffiliateService {
  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private config: WebApiUrls
  ) {}

async getAffiliateUser(userId: string): Promise<AffiliateUser | null> {
  try {
    return await lastValueFrom(
      this.http.get<AffiliateUser>(this.config.setting['GetAffiliateUser'], {
        params: { userId }
      })
    );
  } catch (error) {
    console.error('Error fetching affiliate user:', error);
    return null;
  }
}

  async generateRefCode(userId: string, visitorId: string): Promise<OperationResult> {
    return await lastValueFrom(
      this.http.post<OperationResult>(this.config.setting['GenerateRefCode'], null, {
        params: { userId, visitorId }
      })
    );
  }

  async addPoints(userId: string, points: number): Promise<OperationResult> {
    return await lastValueFrom(
      this.http.post<OperationResult>(this.config.setting['AddPoints'], null, {
        params: { userId, points }
      })
    );
  }

  async addPendingCash(userId: string, amount: number): Promise<OperationResult> {
  return await lastValueFrom(
    this.http.post<OperationResult>(this.config.setting['AddPendingCash'], null, {
      params: { userId, amount }
    })
  );
}
async transferToApprovedCash(userId: string, amount: number): Promise<OperationResult> {
  return await lastValueFrom(
    this.http.post<OperationResult>(this.config.setting['TransferToApprovedCash'], null, {
      params: { userId, amount }
    })
  );
}
async transferToPaidCash(userId: string, amount: number): Promise<OperationResult> {
  return await lastValueFrom(
    this.http.post<OperationResult>(this.config.setting['TransferToPaidCash'], null, {
      params: { userId, amount }
    })
  );
}

  async addEarnings(userId: string, amount: number): Promise<OperationResult> {
    return await lastValueFrom(
      this.http.post<OperationResult>(this.config.setting['AddEarnings'], null, {
        params: { userId, amount }
      })
    );
  }

  async updateCommission(userId: string, newRate: number): Promise<OperationResult> {
    return await lastValueFrom(
      this.http.post<OperationResult>(this.config.setting['UpdateCommission'], null, {
        params: { userId, newRate }
      })
    );
  }

  async updatePaymentDetails(req: PaymentDetails): Promise<OperationResult> {
    return await lastValueFrom(
      this.http.post<OperationResult>(this.config.setting['UpdatePaymentDetails'], req)
    );
  }


async changeStatus(userId: string, status: number): Promise<OperationResult> {
  return await lastValueFrom(
    this.http.post<OperationResult>(this.config.setting['ChangeStatus'], null, {
      params: {
        userId,
        status: status.toString() // send status enum as int
      }
    })
  );
}


  async incrementReferralCount(userId: string): Promise<OperationResult> {
    return await lastValueFrom(
      this.http.post<OperationResult>(this.config.setting['IncrementReferralCount'], null, {
        params: { userId }
      })
    );
  }
    async getPerformance(
      affiliateUserId: string,
      startDate: string,
      endDate: string,
      status: number
    ): Promise<PerformanceChart[]> {
      const params = {
        affiliateUserId: affiliateUserId.toString(),
        startDateStr: startDate,
        endDateStr: endDate,
        status: status.toString()
      };

      return await lastValueFrom(
        this.http.get<PerformanceChart[]>(this.config.setting['GetPerformance'], { params })
      );
    }

}
