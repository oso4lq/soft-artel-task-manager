// register.component.ts

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

  registerForm: FormGroup;
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
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { 'mismatch': true };
  }

  // Form submission
  onSubmit() {

    const username = this.registerForm.get('username')?.value;
    const login = this.registerForm.get('email')?.value;
    const password = this.registerForm.get('password')?.value;

    if (!login || !password) {
      const missingFields = [];
      if (!username) missingFields.push('ваше имя');
      if (!login) missingFields.push('email');
      if (!password) missingFields.push('пароль');
      this.showErrorMessage(`Пожалуйста, введите ${missingFields.join(' и ')}`);
      return;
    }

    if (this.registerForm.valid) {
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

  goToLoginPage() {
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
