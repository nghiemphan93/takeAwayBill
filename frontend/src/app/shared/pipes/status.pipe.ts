import { Pipe, PipeTransform } from '@angular/core';
import { LiveOrderStatus } from '../../models/LiveOrder';

@Pipe({
  name: 'status',
})
export class StatusPipe implements PipeTransform {
  transform(value: LiveOrderStatus, isShort = true): unknown {
    switch (value) {
      case LiveOrderStatus.CONFIRMED:
        return 'Neu';
      case LiveOrderStatus.KITCHEN:
        return 'Küche';
      case LiveOrderStatus.IN_DELIVERY:
        return isShort ? 'Weg' : 'Auf dem Weg';
      case LiveOrderStatus.DELIVERED:
        return 'Zugestellt';
    }
  }
}
