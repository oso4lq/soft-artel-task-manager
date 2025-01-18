// app.component.ts

import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ModalComponent } from './shared/components/modal/modal.component';
import { LoginComponent } from './shared/components/auth/login/login.component';
import { RegisterComponent } from './shared/components/auth/register/register.component';
import { CommonModule } from '@angular/common';
import { NewTaskComponent } from './shared/components/new-task/new-task.component';
import { EditTaskComponent } from './shared/components/edit-task/edit-task.component';
import { TaskCard } from './shared/models/task.models';
import { TasksService } from './core/services/tasks.service';
import { AuthService } from './core/services/auth.service';
import { UsersService } from './core/services/users.service';
import { Store } from '@ngrx/store';
import { loadAuthFromIndexedDb } from './core/store/auth/auth.actions';
import { loadTasks } from './core/store/tasks/tasks.actions';
import { HeaderComponent } from './shared/components/header/header.component';
import { TimeService } from './core/services/time.service';
import { loadUsers } from './core/store/users/users.actions';
import { MobileService } from './core/services/mobile.service';
import { SyncService } from './core/services/sync.service';
import { MobileMenuComponent } from './shared/components/mobile-menu/mobile-menu.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    MobileMenuComponent,
    ModalComponent,
    LoginComponent,
    RegisterComponent,
    NewTaskComponent,
    EditTaskComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  title = 'soft-artel-task-manager';

  // State
  task: any = null;

  // Visibility
  showAuthModal = signal(false);

  // Form to open
  modalMode = signal<'login' | 'register' | 'newTask' | 'editTask' | 'none'>('none');

  constructor(
    private tasksService: TasksService,
    private usersService: UsersService,
    private authService: AuthService,
    private timeService: TimeService,
    private syncService: SyncService,
    public mobileService: MobileService,
    private store: Store,
  ) { }

  ngOnInit(): void {
    // Load Auth from the IndexedDB cache
    this.store.dispatch(loadAuthFromIndexedDb());
    // Load tasks from the IndexedDB cache
    this.store.dispatch(loadTasks());
    // Load userDatas from the IndexedDB cache
    this.store.dispatch(loadUsers());

    // Load tasks from the Firestore
    this.tasksService.loadTasks();
    // Load userDatas from the Firestore
    this.usersService.loadUserDatas();

    // Refresh date and time
    setInterval(() => {
      const oldValue = this.timeService.timeSignal();
      const newValue = new Date();
      this.timeService.timeSignal.set(newValue);

      // Check calendar day
      if (oldValue.getDate() !== newValue.getDate()) {
        this.timeService.dateSignal.set(newValue);
      }
    }, 1000);
  }

  openLoginModal() {
    this.modalMode.set('login');
    this.showAuthModal.set(true);
  }

  openRegisterModal() {
    this.modalMode.set('register');
    this.showAuthModal.set(true);
  }

  openNewTaskModal() {
    this.modalMode.set('newTask');
    this.showAuthModal.set(true);
  }

  openEditTaskModal(receivedTask: TaskCard) {
    this.task = receivedTask;
    this.modalMode.set('editTask');
    this.showAuthModal.set(true);
  }

  closeModal() {
    this.showAuthModal.set(false);
    this.modalMode.set('none');
    this.task = null;
  }

}
