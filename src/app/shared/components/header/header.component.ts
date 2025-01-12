import { Component, Input } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { User } from 'firebase/auth';

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
  @Input() user!: User | null;

// User popup
isUserPopupOpen = false;

constructor(
  // private tasksService: TasksService,
  private authService: AuthService,
  private router: Router,
  // private store: Store,
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
