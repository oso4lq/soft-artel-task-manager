// task-card.component.ts

import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { TaskCard } from '../../models/task.models';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './task-card.component.html',
  styleUrls: ['./task-card.component.scss']
})
export class TaskCardComponent implements OnInit {

  // Task to display
  @Input() task!: TaskCard;

  // Signal "hoveredTop" to display the path
  hoveredTop = signal(false);
  // Signal "hoveredBottom" to display the buttons
  hoveredBottom = signal(false);

  // For debounce effect
  private hoverTopSubject = new Subject<boolean>();
  private hoverBottomSubject = new Subject<boolean>();

  ngOnInit(): void {
    // Subscribe with a 300ms debounce for the Top Card Part
    this.hoverTopSubject
      .pipe(debounceTime(300))
      .subscribe((value) => {
        this.hoveredTop.set(value);
      });

    // Subscribe with a 800ms debounce for the Bottom Card Part
    this.hoverBottomSubject
      .pipe(debounceTime(800))
      .subscribe((value) => {
        this.hoveredBottom.set(value);
      });
  }

  // mouseenter / mouseleave for the Top Card Part
  onTopHover(isHover: boolean) {
    this.hoverTopSubject.next(isHover);
  }

  // mouseenter / mouseleave for the Bottom Card Part
  onBottomHover(isHover: boolean) {
    this.hoverBottomSubject.next(isHover);
  }
}
