import { Component, computed, Input, Signal } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { User } from 'firebase/auth';
import { UserData } from '../../models/users.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  @Input() currentTimeStr!: string;
  @Input() shortLastTaskName!: string | null;
  // @Input() user!: User | null | undefined;
  // @Input() user!: Signal<User | null | undefined> 
  // = computed(() => this.authService.currentUserSig()); // track the current user

  // Signals
  currentUser: Signal<User | null | undefined> = computed(() => this.authService.currentUserSig()); // track the current user
  currentUserData: Signal<UserData | null> = computed(() => this.authService.currentUserDataSig()); // track the current user data

  // User popup
  isUserPopupOpen = false;

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
}
