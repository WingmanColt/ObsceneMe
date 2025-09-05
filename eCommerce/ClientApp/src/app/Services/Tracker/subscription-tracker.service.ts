import { Injectable } from "@angular/core";
import { Subscription } from "rxjs";

export interface SubscriptionDetails {
 name?: string;
 fileName?: string;
 subscription?: Subscription;
}

@Injectable({
 providedIn: "root",
})
export class SubscriptionTrackerService {
 private subscriptions: SubscriptionDetails[] = [];

 track(detail: SubscriptionDetails): void {
  this.subscriptions.push(detail);
 }

 release(detail: SubscriptionDetails): void {
  const idx = this.subscriptions.findIndex((sub) => sub.name === detail.name && sub.fileName === detail.fileName);
  if (idx !== -1) {
   this.subscriptions[idx].subscription.unsubscribe();
   this.subscriptions.splice(idx, 1);
  }
 }

 releaseAllForComponent(fileName: string): void {
  const subsForComponent = this.subscriptions.filter((sub) => sub.fileName === fileName);
  subsForComponent.forEach((sub) => this.release(sub));
 }

 get activeSubscriptionsCount(): number {
  return this.subscriptions.length;
 }

 get listActiveSubscriptions(): SubscriptionDetails[] {
  return this.subscriptions;
 }
 
}
