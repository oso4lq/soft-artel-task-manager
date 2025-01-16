// modal.component.ts

import { Component, Input, Output, EventEmitter, ContentChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewTaskComponent } from '../new-task/new-task.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {

  @Input() isOpen = false; // Receive flag to open/close modal
  @Output() closed = new EventEmitter<void>(); // Emit close trigger
  @ContentChild(NewTaskComponent) newTaskCmp!: NewTaskComponent | undefined; // Find NewTaskComponent in <ng-content>

  close() {
    if (this.newTaskCmp) {
      this.newTaskCmp.closeModal(); // Check form changes
    }
    this.closed.emit();
  }

  onOverlayClick() {
    this.close();
  }

  onCloseButtonClick() {
    this.close();
  }
}
