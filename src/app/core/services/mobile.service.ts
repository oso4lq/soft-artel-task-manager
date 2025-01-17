import { Injectable } from '@angular/core';
import { fromEvent, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MobileService {

  private isMobileSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(window.innerWidth <= 768);
  isMobile$ = this.isMobileSubject.asObservable();

  constructor() {
    fromEvent(window, 'resize').subscribe(() => {
      this.isMobileSubject.next(window.innerWidth <= 768);
    });
  }

  get isMobile(): boolean {
    return this.isMobileSubject.value;
  }

}