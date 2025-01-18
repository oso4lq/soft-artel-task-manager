// users.service.ts

import { Injectable, signal } from '@angular/core';
import { UsersFirebaseService } from './users-firebase.service';
import { UserData } from '../../shared/models/users.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  userDatasSig = signal<UserData[]>([]); // Signal to hold the users list

  constructor(
    private usersFirebaseService: UsersFirebaseService,
  ) { }

  // Fetch the userDatas from Firebase and set them in the signal
  loadUserDatas(): void {
    this.usersFirebaseService.getUsers().subscribe((users: UserData[]) => {
      // console.log('loadUserDatas ', users);
      this.userDatasSig.set(users);
    })
  }

  // Update a user data (local and to Firebase)
  updateUserData(updatedUserData: UserData): void {
    // console.log('updateUserData', updatedUserData);
    this.usersFirebaseService.updateUser(updatedUserData).then(() => {
      this.userDatasSig.update((userDatas) =>
        userDatas.map((userdata) => (userdata.id === updatedUserData.id ? updatedUserData : userdata))
      );
    });
  }

  // Delete a user data (local and from Firebase)
  deleteUserData(userDataId: string | number): void {
    // console.log('deleteUserData', userDataId);
    this.usersFirebaseService.deleteUser(userDataId).then(() => {
      this.userDatasSig.update((users) => users.filter((userdata) => userdata.id !== userDataId));
    });
  }
}