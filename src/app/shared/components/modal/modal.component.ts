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

  @Input() isOpen = false;

  // @Output() closed = new EventEmitter<void>();

  // Emit the close reason
  @Output() closed = new EventEmitter<'overlay' | 'closeButton'>();

  // Find NewTaskComponent in <ng-content>
  @ContentChild(NewTaskComponent) newTaskCmp!: NewTaskComponent | undefined;

  close() {
    this.closed.emit();
  }

  onOverlayClick() {

    // this.closed.emit('overlay');

    if (this.newTaskCmp) {
      // closeModal() from newTaskCmp
      // this.newTaskCmp.closeModalFromOutside();
      this.newTaskCmp.closeModal();
    } else {
      // If nothing found, just close
      this.close();
    }
  }

  onCloseButtonClick() {
    this.closed.emit('closeButton');
  }
}
