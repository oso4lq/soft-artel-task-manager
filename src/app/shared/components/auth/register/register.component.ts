// register.component.ts

import { Component } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { AppComponent } from '../../../../app.component';

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

  // State
  registerForm: FormGroup;
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private router: Router,
    private parent: AppComponent,
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

    if (!username || !login || !password) {
      const missingFields = [];
      if (!username) missingFields.push('ваше имя');
      if (!login) missingFields.push('email');
      if (!password) missingFields.push('пароль');
      this.showErrorMessage(`Пожалуйста, введите ${missingFields.join(' и ')}`);
      return;
    }

    if (this.registerForm.valid) {
      this.errorMessage = null;
      this.authService.register(login, username, password).subscribe({
        next: () => this.parent.closeModal(),
        error: (err) => {
          this.showErrorMessage(err.message ?? err);
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

  goToLogin() {
    this.parent.closeModal();
    this.parent.openLoginModal();
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
