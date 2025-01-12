// login.component.ts

import { Component, computed } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

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

  loginForm: FormGroup;
  errorMessage: string | null = null;

  // isSubmitted for waiting for response
  isSubmitted = false;
  // submitSuccess for received positive response
  submitSuccess = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  currentUser = computed(() => this.authService.currentUserSig());

  // Form submission
  onSubmit() {

    const login = this.loginForm.get('email')?.value;
    const password = this.loginForm.get('password')?.value;

    if (!login || !password) {
      const missingFields = [];
      if (!login) missingFields.push('email');
      if (!password) missingFields.push('пароль');
      this.showErrorMessage(`Пожалуйста, введите ${missingFields.join(' и ')}`);
      return;
    }

    if (this.loginForm.valid) {
      this.errorMessage = '';
      this.isSubmitted = true;
      // this.currentFormState = FormLoginState.Submit;

      this.authService
        .login(login, password)
        .subscribe({
          next: () => {
            // this.currentFormState = FormLoginState.Success;
            // setTimeout(() => this.closeDialogAndNavigate(), 300);
          },
          error: (err) => {
            // this.currentFormState = FormLoginState.Error;
            this.errorMessage = 'Error occurred: ' + err.code;
            setTimeout(() => this.errorMessage = null, 3000);
          }
        })
    }
  }

  private showErrorMessage(message: string) {
    this.errorMessage = message;
    setTimeout(() => (this.errorMessage = ''), 5000);
  }

  goToRegisterPage() {
    this.router.navigate(['/register']);
  }

  signInAnonymously() {
    this.authService.signInAnonymouslyUser()
      .then(() => {
        this.router.navigate(['/main']);
      })
      .catch(error => {
        this.errorMessage = error.message;
      });
  }
}
