import { Injectable, ElementRef, NgZone, Inject } from '@angular/core';
import { isPlatformBrowser, DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';

import { coerceElement } from '../coerce-element/coerce-element';

export type FocusOrigin = 'keyboard' | 'mouse' | null;

export interface ElementFocusState {
  stopMonitoring: () => void;
  subject: Subject<FocusOrigin>;
}

@Injectable({ providedIn: 'root' })
export class FocusMonitor {
  private elementsStorage = new Map<HTMLElement, ElementFocusState>();
  private monitoredElementCount = 0;
  private currentOrigin: FocusOrigin;

  private documentMousedownListener = () => (this.currentOrigin = 'mouse');
  private documentKeydownListener = () => (this.currentOrigin = 'keyboard');

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private ngZone: NgZone
  ) {}

  public monitor(element: HTMLElement | ElementRef<HTMLElement>) {
    if (!isPlatformBrowser) {
      return null;
    }

    const nativeElement = coerceElement(element);
    const focusState: ElementFocusState = {
      stopMonitoring: null as any,
      subject: new Subject<FocusOrigin>()
    };

    if (this.elementsStorage.has(nativeElement)) {
      return this.elementsStorage.get(nativeElement).subject.asObservable();
    } else {
      this.elementsStorage.set(nativeElement, focusState);
    }

    this.addGlobalListeners();
    this.addElementListeners(nativeElement, focusState);

    return focusState.subject.asObservable();
  }

  public stopMonitoring(element: HTMLElement | ElementRef<HTMLElement>) {
    if (!isPlatformBrowser) {
      return null;
    }

    const nativeElement = coerceElement(element);
    const focusState = this.elementsStorage.get(nativeElement);
    if (focusState) {
      focusState.stopMonitoring();
      this.elementsStorage.delete(nativeElement);
      this.removeGlobalListeners();
    }
  }

  //  Add global listeners to the current document.
  private addGlobalListeners() {
    if (++this.monitoredElementCount === 1) {
      this.ngZone.runOutsideAngular(() => {
        this.document.addEventListener(
          'mousedown',
          this.documentMousedownListener
        );
        this.document.addEventListener('keydown', this.documentKeydownListener);
      });
    }
  }

  //  Remove global listeners from the current document.
  private removeGlobalListeners() {
    if (!--this.monitoredElementCount) {
      this.document.removeEventListener(
        'mousedown',
        this.documentMousedownListener
      );
      this.document.removeEventListener(
        'keydown',
        this.documentKeydownListener
      );
    }
  }

  private addElementListeners(
    nativeElement: HTMLElement,
    focusState: ElementFocusState
  ) {
    const focusListener = (event: FocusEvent) =>
      this.focusOrigin(event, focusState.subject);
    const blurListener = (event: FocusEvent) =>
      this.focusOrigin(event, focusState.subject);

    focusState.stopMonitoring = () => {
      nativeElement.removeEventListener('focus', focusListener, true);
      nativeElement.removeEventListener('blur', blurListener, true);
    };

    this.ngZone.runOutsideAngular(() => {
      nativeElement.addEventListener('focus', focusListener, true);
      nativeElement.addEventListener('blur', blurListener, true);
    });
  }

  private focusOrigin(event: FocusEvent, subject: Subject<FocusOrigin>) {
    let by: FocusOrigin = null;
    if (event.type === 'focus') {
      by = this.currentOrigin || 'keyboard';
    }
    this.ngZone.run(() => subject.next(by));
  }
}
