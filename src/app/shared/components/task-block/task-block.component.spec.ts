import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskBlockComponent } from './task-block.component';

describe('TaskBlockComponent', () => {
  let component: TaskBlockComponent;
  let fixture: ComponentFixture<TaskBlockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskBlockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
