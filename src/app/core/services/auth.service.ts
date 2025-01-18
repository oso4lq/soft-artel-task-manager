// src/app/core/services/auth.service.ts

import { inject, Injectable, signal } from '@angular/core';
import { Auth, signInAnonymously, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User, user, updateProfile } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { from, Observable, Subscription } from 'rxjs';
import { UserData } from '../../shared/models/users.model';
import { UsersFirebaseService } from './users-firebase.service';
import { doc, setDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  firebaseAuth = inject(Auth);
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<User | null | undefined>(undefined);  // Stores the user from Auth
  currentUserDataSig = signal<UserData | null>(null);  // Stores the user data from Firestore
  private userDataSubscription: Subscription | null = null;  // Store the subscription to user data

  constructor(
    private auth: Auth,
    private usersFirebaseService: UsersFirebaseService,
    private router: Router,
  ) {
    this.monitorAuthState();
  }

  // Monitor Firebase Authentication state
  monitorAuthState(): void {
    onAuthStateChanged(this.firebaseAuth, (firebaseUser) => {

      // If authenticated user found, set user and userData
      if (firebaseUser) {
        this.currentUserSig.set(firebaseUser);

        if (firebaseUser.uid) {

          // Unsubscribe from any previous subscription
          if (this.userDataSubscription) {
            this.userDataSubscription.unsubscribe();
          }

          // Subscribe to getUserById for the current user
          this.userDataSubscription = this.usersFirebaseService
            .getUserById(firebaseUser.uid)
            .subscribe(userData => {
              this.currentUserDataSig.set(userData);
              // console.log('User data fetched: ', this.currentUserDataSig());
            });
        }
        // If no authenticated user, set to null user and userData
      } else {
        this.setUserDataNull();
      }
    });
  }

  setUserDataNull() {
    this.currentUserSig.set(null);
    this.currentUserDataSig.set(null);

    // Unsubscribe from the Firestore user data subscription
    if (this.userDataSubscription) {
      this.userDataSubscription.unsubscribe();
      this.userDataSubscription = null;  // Reset the subscription
    }
  }

  // email/password sign up
  register(email: string, username: string, password: string): Observable<void> {
    // console.log('register user');
    const promise = createUserWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(async (response) => {
        await updateProfile(response.user, { displayName: username });

        // Create UserData document using name
        const userId = response.user.uid;
        const userDocRef = doc(this.usersFirebaseService.firestore, 'users', userId);
        const userData: UserData = {
          id: userId,
          username: username,
          img: '',
          email: email,
          telegram: '',
          tasks: [],
        };
        await setDoc(userDocRef, userData);

        this.router.navigate(['/main']);
      })
      .catch((error) => {
        console.error('Ошибка регистрации:', error);
        throw error;
      });

    return from(promise);
  }

  // email/password sign in
  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password,
    ).then(() => {
      this.router.navigate(['/main']);
    })
      .catch((error) => {
        console.error('Ошибка входа:', error);
        throw error;
      });

    return from(promise);
  }

  // Sign out
  logout(): Observable<void> {
    // console.log('logout, signOut');
    const promise = signOut(this.firebaseAuth)
      .then(() => {
        this.setUserDataNull();
        return this.signInAnonymouslyUser();
      })
      .then(() => {
        this.router.navigate(['/main']);
      })
      .catch((error) => {
        console.error('Ошибка выхода:', error);
        throw error;
      });

    return from(promise);
  }

  // Sign in anonymously
  signInAnonymouslyUser(): Promise<void> {
    // console.log('signInAnonymouslyUser', this.auth);
    return signInAnonymously(this.auth)
      .then(() => { })
      .catch((error) => {
        console.error('Ошибка анонимного входа:', error);
        throw error;
      });
  }
}
