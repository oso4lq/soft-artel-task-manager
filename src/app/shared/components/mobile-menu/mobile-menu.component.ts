import { CommonModule } from '@angular/common';
import { Component, computed, Signal } from '@angular/core';
import { IconComponent } from '../../icon/icon/icon.component';
import { UserData } from '../../models/users.model';
import { AuthService } from '../../../core/services/auth.service';
import { UsersService } from '../../../core/services/users.service';
import { AppComponent } from '../../../app.component';

@Component({
  selector: 'app-mobile-menu',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
  ],
  templateUrl: './mobile-menu.component.html',
  styleUrl: './mobile-menu.component.scss'
})
export class MobileMenuComponent {

  // Signals
  currentUserData: Signal<UserData | null> = computed(() => this.authService.currentUserDataSig()); // track the current user data
  userDatas: Signal<UserData[]> = computed(() => this.usersService.userDatasSig()); // track the userDatas array

  get unreadMessagesCount(): number {
    // We temporarily access UserData.tasks because message counter may be added later
    return this.currentUserData()?.tasks?.length || 0;
  }

  get usersCount(): number {
    // We temporarily access Firebase/users to count users instead of whatever
    return this.userDatas()?.length || 0;
  }

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private parent: AppComponent,
  ) { }

  // Create button and related
  newTask() {
    if (this.currentUserData()) {
      this.parent.openNewTaskModal();
    } else {
      this.parent.openLoginModal();
    }
  }
}
