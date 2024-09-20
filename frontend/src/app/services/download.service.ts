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

  toPdf(orders: Array<Array<any>>, sums: string[], headers: string[]) {
    const docDefinition = {
      content: [
        {
          text: headers[0],
          style: 'header'
        },
        {
          text: headers[1],
          margin: [0, 5, 0, 2]
        },
        {
          text: headers[2],
          margin: [0, 2, 0, 10]
        },
        {
          text: sums[0],
        },
        {
          text: sums[1],
        },
        {
          text: sums[2],
          margin: [0, 0, 0, 10]
        },
        {
          layout: 'headerLineOnly',
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', 'auto', 'auto'],
            body: orders,
            alignment: 'center'
          }
        }
      ],
      styles: {
        header: {
          bold: true,
          fontSize: 24
        },
      }
    };

    // @ts-ignore
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
