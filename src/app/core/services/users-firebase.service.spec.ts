import { TestBed } from '@angular/core/testing';

import { UsersFirebaseService } from './users-firebase.service';

describe('UsersFirebaseService', () => {
  let service: UsersFirebaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersFirebaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
