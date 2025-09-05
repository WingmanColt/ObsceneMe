import { Component, OnInit } from '@angular/core';
import { OrderHistory } from 'src/app/shared/classes/orderHistory';

@Component({
  selector: 'app-private-office-orders',
  templateUrl: './private-office-orders.component.html',
  styleUrl: './private-office-orders.component.scss'
})
export class PrivateOfficeOrdersComponent implements OnInit {

  isLoading: number = 0;
  selectedTimePeriod: string = 'all';

  orderHistory: OrderHistory[];
  orderHistoryFiltered: OrderHistory[];
  
  ngOnInit(): void {
  if (this.orderHistory) {
    this.filterOrders('all');
  } else {
    this.isLoading = 2; // still loading
  }
}


filterOrders(timePeriod: string) {
  this.selectedTimePeriod = timePeriod;

  if (!this.orderHistory || this.orderHistory.length === 0) {
    this.orderHistoryFiltered = [];
    this.isLoading = 2; // no data
    return;
  }

  const filtered = this.orderHistory.filter(order =>
    this.filterByTimePeriod(order, timePeriod)
  );

  this.orderHistoryFiltered = filtered.sort((a, b) =>
    this.compareDates(b.createdOn, a.createdOn)
  );

  this.isLoading = filtered.length > 0 ? 1 : 2;
}


  private compareDates(dateStrA: string, dateStrB: string): number {
    const dateA = new Date(dateStrA);
    const dateB = new Date(dateStrB);

    return dateB.getTime() - dateA.getTime();
  }
  private filterByTimePeriod(order: OrderHistory, timePeriod: string): boolean {
    const currentDate = new Date();
    const orderDate = this.getDateParts(order.createdOn);

    orderDate.day = +orderDate.day;
    orderDate.month = +orderDate.month;
    orderDate.year = +orderDate.year;

  
  switch (timePeriod) {
    case 'this_month':
      // Filter orders for the current month
      return orderDate.month === currentDate.getMonth() + 1 && orderDate.year === currentDate.getFullYear();
    case 'month_ago':
      const lastMonth = new Date(currentDate);
      lastMonth.setMonth(currentDate.getMonth() - 1);
      return orderDate.month === lastMonth.getMonth() + 1 && orderDate.year === lastMonth.getFullYear();
    case 'this_year':
      return orderDate.year === currentDate.getFullYear();
    case 'year_ago':
      const lastYear = currentDate.getFullYear() - 1;
      return orderDate.year === lastYear;
    default:
      return true;
  }
}

private getDateParts(date: string): { day: number, month: number, year: number } {
  // Convert the input string to a Date object
  const dateObject = new Date(date);

  // Extract day, month, and year
  const day = dateObject.getDate();
  const month = dateObject.getMonth() + 1; // Months are zero-based, so add 1
  const year = dateObject.getFullYear();

  return { day, month, year };
}
}
