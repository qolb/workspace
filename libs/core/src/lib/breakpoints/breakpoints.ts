import { InjectionToken } from '@angular/core';

export const DEFAULT_BREAKPOINTS: Map<string, string> = new Map([
  ['xs', 'screen and (max-width: 599px)'],
  ['sm', 'screen and (min-width: 600px) and (max-width: 959px)'],
  ['md', 'screen and (min-width: 960px) and (max-width: 1279px)'],
  ['lg', 'screen and (min-width: 1280px) and (max-width: 1919px)'],
  ['xl', 'screen and (min-width: 1920px)']
]);

export const BREAKPOINTS = new InjectionToken<Map<string, string>>(
  'DEFAULT_BREAKPOINTS',
  {
    providedIn: 'root',
    factory: () => {
      return DEFAULT_BREAKPOINTS;
    }
  }
);
