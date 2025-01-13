// header.component.ts

import { Component, computed, Input, Signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { User } from 'firebase/auth';
import { UserData } from '../../models/users.model';
import { ModalComponent } from '../modal/modal.component';
import { NewTaskComponent } from '../new-task/new-task.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    NewTaskComponent,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  @Input() currentTimeStr!: string;
  @Input() shortLastTaskName!: string | null;

  // Signals
  currentUser: Signal<User | null | undefined> = computed(() => this.authService.currentUserSig()); // track the current user
  currentUserData: Signal<UserData | null> = computed(() => this.authService.currentUserDataSig()); // track the current user data

  // User popup
  isUserPopupOpen = false;

  // Modal window
  isModalOpen = false;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) { }

  toggleUserPopup() {
    this.isUserPopupOpen = !this.isUserPopupOpen
  }

  logout() {
    this.authService.logout()
  }

  goToLogin() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  openModal() {
    this.isModalOpen = true;
  }

  onModalClosed() {
    this.isModalOpen = false;
  }
}
