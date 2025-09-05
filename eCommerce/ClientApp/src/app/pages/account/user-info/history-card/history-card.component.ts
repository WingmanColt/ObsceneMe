import { Component, Input } from '@angular/core';
import { environment } from 'environments/environment';

import { OrderService } from 'src/app/Services/Order/order.service';
import { BaseService } from 'src/app/Services/base.service';
import { ApproveType } from 'src/app/shared/classes/enums/approveType';
import { Order } from 'src/app/shared/classes/order';
import { OrderHistory } from 'src/app/shared/classes/orderHistory';
import { Products } from 'src/app/shared/classes/product';
import { OperationResult } from 'src/app/shared/interfaces/operationResult';

@Component({
  selector: 'app-order-history-card',
  templateUrl: './history-card.component.html',
  styleUrl: './history-card.component.scss'
})
export class HistoryCardComponent {

  @Input() orderHistory: OrderHistory;
  approveType: ApproveType = ApproveType.Waiting;

  env = environment;
  defaultImage: string = environment.placeholderSrc;
  oldQuantity: number = 0;
  totalQuantity: number = 0;

  constructor(private _baseService: BaseService, private _orderService: OrderService) {

  }

  getApproveText(): string {
    switch (this.orderHistory.approveType) {
      case ApproveType.Waiting: return 'Pending approval';
      case ApproveType.Rejected: return 'Rejected order';
      case ApproveType.Success: return 'Approved order';
      default: return '';
    }

  }

  async increment(orderId: number, productId: number): Promise<void> {
    const productIndex = this.orderHistory.products.findIndex((product) => product.id === productId);

    if (productIndex !== -1) {
      // If the product with the given id is found, increment the quantity
      this.orderHistory.products[productIndex].quantity = (this.orderHistory.products[productIndex].quantity || 0) + 1;
      await this.updateOrder(orderId, this.orderHistory.products[productIndex]);
    }
  }

  async decrement(orderId: number, productId: number): Promise<void> {
    const productIndex = this.orderHistory.products.findIndex((product) => product.id === productId);

    if (productIndex !== -1) {
      // If the product with the given id is found, decrement the quantity
      this.orderHistory.products[productIndex].quantity = Math.max((this.orderHistory.products[productIndex].quantity || 0) - 1, 0);
      await this.updateOrder(orderId, this.orderHistory.products[productIndex]);
    }
  }


  async updateOrder(orderId: number, product: Products) {
    const orderReq: Order = {
      Id: orderId,
      productId: product.id,
      quantity: product.quantity,
      totalCost: product.price * product.quantity,
      totalDiscount: product.discountRate * product.quantity
    };

    try {
      // Call the action with a 5-second delay
      const result: OperationResult = await this._orderService.updateOrderHistory(orderReq);


    } catch (error) {

    }
  }

  calcCurrency(val: number) {
    const calculatedVal = (val * this.orderHistory.currency?.price);
    return calculatedVal.toFixed(2);
  }

  getTotalAmount(qty: number) {
    return (this.orderHistory.cost - this.orderHistory.discount) * qty;
  }

  getFormatedDate(date: string) {
    return this._baseService.getFormattedDate(date, true);
  }
}

