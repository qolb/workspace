import { ElementRef } from '@angular/core';

export function coerceElement(element: HTMLElement | ElementRef<HTMLElement>) {
  return element instanceof ElementRef ? element.nativeElement : element;
}
