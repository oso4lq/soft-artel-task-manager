// time.service.ts

import { computed, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TimeService {

  constructor() { }

  // Date 
  dateSignal = signal(new Date());
  currentDateStrSig = computed(() => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    };
    const formatted = new Intl.DateTimeFormat('ru-RU', options).format(this.dateSignal());
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  });

  // Time
  timeSignal = signal(new Date());
  currentTimeStrSig = computed(() => {
    return this.timeSignal().toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  });

}
