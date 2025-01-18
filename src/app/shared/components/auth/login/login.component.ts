// login.component.ts

import { Component, computed, Signal } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { AppComponent } from '../../../../app.component';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  // State
  loginForm: FormGroup;
  errorMessage: string | null = null;

  // Signals
  currentUser: Signal<User | null | undefined> = computed(() => this.authService.currentUserSig()); // track the current User

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private parent: AppComponent,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // Form submission
  onSubmit() {
    const login = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;
    // console.log(login, password);

    if (!login || !password) {
      const missingFields = [];
      if (!login) missingFields.push('email');
      if (!password) missingFields.push('пароль');
      this.showErrorMessage(`Пожалуйста, введите ${missingFields.join(' и ')}`);
      return;
    }

    if (this.loginForm.valid) {
      this.errorMessage = null;
      this.authService.login(login, password).subscribe({
        next: () => this.parent.closeModal(),
        error: (err) => {
          this.showErrorMessage(err);
        },
      });
    }
  }

  private showErrorMessage(msg: string) {
    this.errorMessage = msg;
    setTimeout(() => {
      this.errorMessage = null;
    }, 3000);
  }

  goToRegister() {
    this.parent.closeModal();
    this.parent.openRegisterModal();
  }

  signInAnonymously() {
    this.authService.signInAnonymouslyUser()
      .then(() => {
        this.parent.closeModal();
        this.router.navigate(['/main']);
      })
      .catch(error => {
        this.errorMessage = error.message;
      });
  }
}
