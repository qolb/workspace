import { Injectable, NgZone, Inject } from '@angular/core';
import { from, BehaviorSubject, Observable, Subscription } from 'rxjs';

import { BREAKPOINTS } from '../breakpoints/breakpoints';

@Injectable({ providedIn: 'root' })
export class MediaObserver {
  private window: Window;
  private mediaQueryList: MediaQueryList;

  private queryList$: Observable<[string, string]> = from(this.breakpoints);
  private activeQuery: BehaviorSubject<string> = new BehaviorSubject(null);

  private subscription = new Subscription();

  constructor(
    @Inject(BREAKPOINTS) private breakpoints: Map<string, string>,
    private ngZone: NgZone
  ) {
    this.window = window.top;
    this.observe();
  }

  private observe() {
    this.subscription.add(
      this.queryList$.subscribe(([alias, query]) => {
        this.mediaQueryList = this.window.matchMedia(query);

        this.initQuery(alias);

        this.mediaQueryList.addEventListener(
          'change',
          (event: MediaQueryListEvent) => {
            this.watchQuery(event, alias);
          }
        );
      })
    );
  }

  private initQuery(alias: string) {
    if (this.mediaQueryList.matches) {
      this.ngZone.run(() => {
        this.activeQuery.next(alias);
      });
    }
  }

  private watchQuery(event: MediaQueryListEvent, alias: string) {
    if (event.matches) {
      this.ngZone.run(() => {
        this.activeQuery.next(alias);
      });
    }
  }

  public get media$(): Observable<string> {
    return this.activeQuery;
  }

  public destroy() {
    this.subscription.unsubscribe();
  }
}
