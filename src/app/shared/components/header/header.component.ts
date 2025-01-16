// header.component.ts

import { Component, computed, ElementRef, OnInit, Signal, ViewChild } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { UserData } from '../../models/users.model';
import { AppComponent } from '../../../app.component';
import { TimeService } from '../../../core/services/time.service';
import { TasksService } from '../../../core/services/tasks.service';
import { fromEvent, Subscription } from 'rxjs';
import { IconComponent } from '../../icon/icon/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {

  // Signals
  currentUserData: Signal<UserData | null> = computed(() => this.authService.currentUserDataSig()); // track the current user data
  currentTimeStr: Signal<string> = computed(() => this.timeService.currentTimeStrSig()); // track current time
  shortLastTaskName: Signal<string | null> = computed(() => this.tasksService.shortLastTaskNameSig()); // track latest task

  // State
  showUserPopup = false;
  showCreatePopup = false;

  // Subscriptions
  private clickOutsideSubscription!: Subscription;

  // References to elements
  @ViewChild('userPopup') userPopup!: ElementRef;
  @ViewChild('userAvatar') userAvatar!: ElementRef;
  @ViewChild('createBtn') createBtn!: ElementRef;

  get unreadMessagesCount(): number {
    // We temporarily access UserData.tasks because message counter may be added later
    return this.currentUserData()?.tasks?.length || 0;
  }

  constructor(
    private tasksService: TasksService,
    private authService: AuthService,
    private timeService: TimeService,
    private parent: AppComponent,
  ) { }

  ngOnInit(): void { }

  ngOnDestroy(): void {
    this.unsubscribeClickOutside();
  }

  // Create button and related
  newTask() {
    if (this.currentUserData()) {
      this.parent.openNewTaskModal();
    } else {
      this.parent.openLoginModal();
    }
  }

  // Handlers for create button hover
  onCreateMouseEnter(): void {
    this.showCreatePopup = true;
  }

  onCreateMouseLeave(): void {
    this.showCreatePopup = false;
  }

  onCreateTaskClick(): void {
    this.newTask();
    this.showCreatePopup = false;
  }

  onCreateProjectClick(): void {
    console.log('Эта функция ещё не разработана');
    this.showCreatePopup = false;
  }


  // User popup and related
  toggleUserPopup(): void {
    this.showUserPopup = !this.showUserPopup;
    if (this.showUserPopup) {
      this.subscribeClickOutside();
    } else {
      this.unsubscribeClickOutside();
    }
  }

  // Handlers for create button hover
  subscribeClickOutside(): void {
    this.clickOutsideSubscription = fromEvent(document, 'click').subscribe((event: Event) => {
      const target = event.target as HTMLElement;
      if (this.userPopup && this.userAvatar) {
        const clickedInsidePopup = this.userPopup.nativeElement.contains(target);
        const clickedOnAvatar = this.userAvatar.nativeElement.contains(target);
        if (!clickedInsidePopup && !clickedOnAvatar) {
          this.showUserPopup = false;
          this.unsubscribeClickOutside();
        }
      }
    });
  }

  unsubscribeClickOutside(): void {
    if (this.clickOutsideSubscription) {
      this.clickOutsideSubscription.unsubscribe();
    }
  }

  onLogoutClick() {
    this.authService.logout();
    this.parent.openLoginModal();
  }

  onLoginClick() {
    this.authService.logout();
    this.parent.openLoginModal();
  }

}
