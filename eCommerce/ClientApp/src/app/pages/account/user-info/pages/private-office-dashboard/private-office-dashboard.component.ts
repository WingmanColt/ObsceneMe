import { Component, OnInit } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { environment } from 'environments/environment';
import { AccountService } from 'src/app/Services/Account/account.service';
import { AffiliateService } from 'src/app/Services/Account/affiliate.service';
import { BaseService } from 'src/app/Services/base.service';
import { AuthResponse, User } from 'src/app/shared/classes/account';
import { AffiliateUser } from 'src/app/shared/classes/affiliateUser';
import FingerprintJS from '@fingerprintjs/fingerprintjs';

@Component({
  selector: 'app-private-office-dashboard',
  templateUrl: './private-office-dashboard.component.html',
  styleUrl: './private-office-dashboard.component.scss'
})
export class PrivateOfficeDashboardComponent implements OnInit {
  env = environment;

  activeUser: User;
  affiliateUser: AffiliateUser;
  referralLink: string;
  generatedLink: string;

  isLoaded: boolean = false;
  isPerformanceLoading: boolean = false;
  outputMessage: string;
  activeTab: 'commission' | 'program' = 'commission';

  now: Date = new Date();
  startDate = new Date(this.now.getFullYear(), this.now.getMonth(), 1).toISOString().slice(0, 10);
  endDate = new Date(this.now.getFullYear(), this.now.getMonth() + 1, 1).toISOString().slice(0, 10);
  status = 1;

  public chartData = [
    { data: [], label: 'Total Revenue', tension: 0.4, fill: true },
    { data: [], label: 'Order Count', tension: 0.4, fill: true }
  ];

  public chartLabels: string[] = [];
  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'left'
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => `Date: ${tooltipItems[0].label}`,
          label: (tooltipItem) => `Revenue: ${tooltipItem.raw}`
        }
      }
    },
    scales: {
      x: {
        ticks: {
          callback: function (this: any, value: string | number, index: number, ticks: any[]): string | number {
            const label = this.chart.data.labels[index];
            const date = new Date(label);
            return !isNaN(date.getTime()) ? date.getDate() : label;
          }
        },
        title: {
          display: true,
          text: 'Day'
        }
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Revenue'
        }
      }
    }
  };

  constructor(
    protected baseService: BaseService,
    private affiliateService: AffiliateService,
    private accountService: AccountService
  ) {}

  async ngOnInit(): Promise<void> {
    this.isLoaded = false;
    await this.fetchCurrentUser();

    if (this.activeUser?.isAffiliate) {
      await this.fetchAffiliateUser(this.activeUser.id);
      await this.loadPerformanceData();
    }

    setTimeout(() => {
      this.isLoaded = true;
    }, 100); // slight delay to smooth transition
  }

  async fetchCurrentUser() {
    try {
      const response: AuthResponse = await this.accountService.waitForCurrentUser();
      if (response.user) {
        this.activeUser = response.user;
        if (!this.activeUser?.isAffiliate) this.isLoaded = true;
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
      this.isLoaded = false;
    }
  }

  async fetchAffiliateUser(userId: string) {
    try {
      const affiliateUser = await this.affiliateService.getAffiliateUser(userId);
      if (affiliateUser) {
        this.affiliateUser = affiliateUser;
        this.referralLink = affiliateUser.referralCode;
        this.generatedLink = this.referralLink ? (this.env.webUrl + 'ref=' + this.referralLink) : "No Link Generated Yet.";
      }
    } catch (error) {
      console.error('Failed to fetch affiliate user:', error);
    }
  }

  async onGenerateCode(): Promise<void> {
    try {
      const visitorId = await getVisitorId();
      const response = await this.affiliateService.generateRefCode(this.activeUser.id, visitorId);

      if (!response.success) {
        this.outputMessage = response.failureMessage;
      } else {
        this.referralLink = response.successMessage;
        this.generatedLink = this.env.webUrl + 'ref=' + this.referralLink;
        await this.affiliateService.updateCommission(this.activeUser.id, this.affiliateUser.commissionRate);
      }
    } catch (error) {
      console.error('Error generating referral code:', error);
    }
  }

  copyToClipboard(text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(
        () => alert('Copied to clipboard!'),
        () => alert('Failed to copy')
      );
    } else {
      alert('Clipboard API not supported in this browser.');
    }
  }

  async loadPerformanceData() {
    this.isPerformanceLoading = true;
    try {
      const rawData = await this.affiliateService.getPerformance(
        this.affiliateUser.userId,
        this.startDate,
        this.endDate,
        this.status
      );

      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      const dateMap: Record<string, { totalRevenue: number, orderCount: number }> = {};
      for (let day = 1; day <= daysInMonth; day++) {
        const d = new Date(year, month, day);
        const key = d.toISOString().substring(0, 10);
        dateMap[key] = { totalRevenue: 0, orderCount: 0 };
      }

      for (const entry of rawData) {
        const key = entry.date.substring(0, 10);
        if (dateMap[key]) {
          dateMap[key] = {
            totalRevenue: entry.totalRevenue,
            orderCount: entry.orderCount
          };
        }
      }

      const labels: string[] = [];
      const revenues: number[] = [];
      const orders: number[] = [];

      Object.entries(dateMap).forEach(([date, values]) => {
        labels.push(this.formatDateHuman(date));
        revenues.push(values.totalRevenue);
        orders.push(values.orderCount);
      });

      this.chartLabels = labels;
      this.chartData = [
        { data: revenues, label: 'Total Revenue', tension: 0.4, fill: true },
        { data: orders, label: 'Order Count', tension: 0.4, fill: false }
      ];
    } catch (err) {
      console.error('Chart load error:', err);
    } finally {
      this.isPerformanceLoading = false;
    }
  }

  formatDateHuman(dateStr: string): string {
    const date = new Date(dateStr);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  }
}

async function getVisitorId() {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return result.visitorId;
}
