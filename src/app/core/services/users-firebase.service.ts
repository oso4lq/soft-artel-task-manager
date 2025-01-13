// users-firebase.service.ts

import { inject, Injectable } from '@angular/core';
import { addDoc, collection, collectionData, deleteDoc, doc, docData, Firestore, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { UserData } from '../../shared/models/users.model';

@Injectable({
  providedIn: 'root'
})
export class UsersFirebaseService {

  firestore = inject(Firestore);
  usersCollection = collection(this.firestore, 'users');

  // Get the list of users from Firebase
  getUsers(): Observable<UserData[]> {
    return collectionData(this.usersCollection, {
      idField: 'id',
    }) as Observable<UserData[]>;
  }

  // Get a specific user by userId
  getUserById(userId: string | number): Observable<UserData> {
    const userDoc = doc(this.firestore, `users/${userId}`);
    return docData(userDoc, { idField: 'id' }) as Observable<UserData>;
  }

  // Add a new user to Firebase
  addUser(newUser: UserData): Promise<void> {
    return addDoc(this.usersCollection, newUser).then(() => { });
  }

  // Update an existing user in Firebase
  updateUser(updatedUser: UserData): Promise<void> {
    const userDoc = doc(this.firestore, `users/${updatedUser.id}`);
    return updateDoc(userDoc, { ...updatedUser });
  }

  // Delete a user from Firebase
  deleteUser(userId: string | number): Promise<void> {
    const userDoc = doc(this.firestore, `users/${userId}`);
    return deleteDoc(userDoc);
  }

}