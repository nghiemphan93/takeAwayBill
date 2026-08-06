import { Injectable } from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { distinctUntilChanged, map, scan } from 'rxjs/operators';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  private readonly spinnerTopRef: OverlayRef;
  private readonly spin$: Subject<number> = new Subject();

  constructor(private readonly overlay: Overlay) {
    this.spinnerTopRef = this.overlay.create({
      hasBackdrop: true,
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
    });

    this.spin$
      .asObservable()
      .pipe(
        scan((acc, next) => {
          if (!next) {
            return 0;
          }
          return acc + next >= 0 ? acc + next : 0;
        }, 0),
        map((val) => val > 0),
        distinctUntilChanged(),
      )
      .subscribe((res) => {
        if (res) {
          this.spinnerTopRef.attach(new ComponentPortal(MatProgressSpinner));
        } else if (this.spinnerTopRef.hasAttached()) {
          this.spinnerTopRef.detach();
        }
      });
  }

  show(): void {
    this.spin$.next(1);
  }

  hide(): void {
    this.spin$.next(-1);
  }

  reset(): void {
    this.spin$.next(0);
  }
}
