import {Injectable} from '@angular/core';
import {Order} from '../models/Order';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

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
  toPdf(orders: Array<Array<any>>) {
    // TODO
    const tempData = [
      ['Datum', '#', '$', '*'],
      ['13-12-2020, 10:13:01', '0OFC9R', '26,60', '*'],
      ['13-12-2020, 10:13:01', '0OFC9R', '26,60', '*'],
      ['13-12-2020, 10:13:01', '0OFC9R', '26,60', '*'],
      ['13-12-2020, 10:13:01', '0OFC9R', '26,60', '*'],
      ['13-12-2020, 10:13:01', '0OFC9R', '26,60', '*'],
    ]

    const docDefinition = {
      content: [
        {
          layout: 'headerLineOnly', // optional
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', 'auto'],
            body: orders
          }
        }
      ]
    };
    // Declaring your layout
    const myTableLayouts = {
      exampleLayout: {
        /*
        Your layout here.
        */
      }
    };


    pdfMake.createPdf(docDefinition).open();
  }

  /**
   * Export to csv file
   * @param orders
   */
  toCsv(orders: Order[]) {
    // TODO
  }
}
