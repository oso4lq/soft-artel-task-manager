import { Injectable } from '@angular/core';
import { fromEvent, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MobileService {

  private isMobileSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(window.innerWidth <= 768);
  isMobile$ = this.isMobileSubject.asObservable();

  swipeLeft$ = new BehaviorSubject<boolean>(false);
  swipeRight$ = new BehaviorSubject<boolean>(false);

  private swipeTrackingEnabled: boolean = true;
  private touchStartX: number = 0;
  private touchEndX: number = 0;
  private touchStartY: number = 0;
  private touchEndY: number = 0;
  // Minimum distance for a valid horizontal swipe
  private readonly minSwipeDeltaX = 50;
  // Maximum Y-axis movement allowed for a valid horizontal swipe
  private readonly maxSwipeDeltaY = 30;

  constructor() {
    fromEvent(window, 'resize').subscribe(() => {
      this.isMobileSubject.next(window.innerWidth <= 768);
    });

    this.initSwipeListeners();
  }

  get isMobile(): boolean {
    return this.isMobileSubject.value;
  }

  disableSwipeTracking(): void {
    this.swipeTrackingEnabled = false;
  }

  enableSwipeTracking(): void {
    this.swipeTrackingEnabled = true;
  }

  private initSwipeListeners(): void {
    window.addEventListener('touchstart', (event) => {
      if (!this.swipeTrackingEnabled) return;
      this.touchStartX = event.changedTouches[0].screenX;
      this.touchStartY = event.changedTouches[0].screenY;
    });

    window.addEventListener('touchend', (event) => {
      if (!this.swipeTrackingEnabled) return;
      this.touchEndX = event.changedTouches[0].screenX;
      this.touchEndY = event.changedTouches[0].screenY;
      this.handleSwipeGesture();
    });
  }

  private handleSwipeGesture(): void {
    // Calculate absolute X-axis and Y-axis distances
    const swipeDistanceX = this.touchEndX - this.touchStartX;
    const swipeDistanceY = Math.abs(this.touchEndY - this.touchStartY);

    // If the Y-axis movement is greater than maxSwipeDeltaY, it's not a valid horizontal swipe
    if (swipeDistanceY > this.maxSwipeDeltaY) {
      return;
    }

    if (swipeDistanceX < -this.minSwipeDeltaX) {
      this.swipeLeft$.next(true);
    } else if (swipeDistanceX > this.minSwipeDeltaX) {
      this.swipeRight$.next(true);
    }
  }
}