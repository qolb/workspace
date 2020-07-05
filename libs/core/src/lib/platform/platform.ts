import { Injectable, Optional, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class Platform {
  public readonly isBrowser: boolean = this.platformId
    ? isPlatformBrowser(this.platformId)
    : typeof document === 'object' && !!document;

  constructor(@Optional() @Inject(PLATFORM_ID) private platformId: string) {}
}
