// edit-task.component.ts

import { Component, EventEmitter, Output, OnInit, Signal, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductType, TaskCard, TaskStatus, TaskType } from '../../models/task.models';
import { TasksService } from '../../../core/services/tasks.service';
import { AuthService } from '../../../core/services/auth.service';
import { sortTaskStatuses } from '../../utils/task-status-utils';
import { UserData } from '../../models/users.model';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-edit-task',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './edit-task.component.html',
  styleUrls: ['./edit-task.component.scss'],
})
export class EditTaskComponent {

}
