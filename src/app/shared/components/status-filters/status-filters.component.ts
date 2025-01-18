import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TaskStatus } from '../../models/task.models';

@Component({
  selector: 'app-status-filters',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './status-filters.component.html',
  styleUrl: './status-filters.component.scss'
})
export class StatusFiltersComponent {

  public TaskStatus = TaskStatus;

  @Input() selectedStatus!: TaskStatus;
  @Input() approvalCount: number = 0;
  @Input() reviewCount: number = 0;
  @Input() executionCount: number = 0;
  @Input() draftCount: number = 0;

  @Output() statusChange = new EventEmitter<TaskStatus.Approval | TaskStatus.Review | TaskStatus.Execution | TaskStatus.Draft>();

  onStatusChange(value: TaskStatus.Approval | TaskStatus.Review | TaskStatus.Execution | TaskStatus.Draft) {
    this.statusChange.emit(value);
  }

}
