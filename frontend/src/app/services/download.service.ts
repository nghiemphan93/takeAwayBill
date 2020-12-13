import {Injectable} from '@angular/core';
import {Order} from "../models/Order";

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  constructor() {
  }

  /**
   * Export to pdf file
   * @param orders
   */
  toPdf(orders: Order[]) {
    // TODO
  }

  /**
   * Export to csv file
   * @param orders
   */
  toCsv(orders: Order[]) {
    // TODO
  }
}
