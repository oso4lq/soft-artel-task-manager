// src/app/core/services/auth.service.ts

import { Injectable } from '@angular/core';
import { Auth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from '@angular/fire/auth';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(private auth: Auth) {
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
    });
  }

  // Sign in anonymously
  signInAnonymouslyUser(): Promise<void> {
    console.log('signInAnonymouslyUser', this.auth);
    return signInAnonymously(this.auth)
      .then(() => { })
      .catch((error) => {
        console.error('Ошибка анонимного входа:', error);
        throw error;
      });
  }

  // email/password sign up
  register(email: string, password: string): Promise<void> {
    console.log('register, createUserWithEmailAndPassword', this.auth, email, password);
    return createUserWithEmailAndPassword(this.auth, email, password)
      .then(() => { })
      .catch((error) => {
        console.error('Ошибка регистрации:', error);
        throw error;
      });
  }

  // email/password sign in
  login(email: string, password: string): Promise<void> {
    console.log('login, signInWithEmailAndPassword', this.auth, email, password);
    return signInWithEmailAndPassword(this.auth, email, password)
      .then(() => { })
      .catch((error) => {
        console.error('Ошибка входа:', error);
        throw error;
      });
  }

  // Sign out
  logout(): Promise<void> {
    console.log('logout, signOut', this.auth);
    return signOut(this.auth)
      .then(() => { })
      .catch((error) => {
        console.error('Ошибка выхода:', error);
        throw error;
      });
  }
}
