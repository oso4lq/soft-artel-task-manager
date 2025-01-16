// icon.component.ts

import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ProductType, TaskStatus, TaskType } from '../../models/task.models';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [
    CommonModule,
  ],
  template: `
    <svg 
        class="icon" 
        [attr.width]="width" 
        [attr.height]="height" 
        [ngStyle]="{'color': color}" 
        aria-hidden="true"
      >
      <use [attr.href]="'#' + iconId"></use>
    </svg>
`,
  styles: [`
  .icon {
    display: inline-block;
    fill: currentColor;
    /* width: 1em;
    height: 1em; */
    transition: color 0.3s ease;
  }
`]
})
export class IconComponent {

  @Input() iconId!: string;
  @Input() width: string | number = '16';
  @Input() height: string | number = '16';
  @Input() color: string | undefined = 'currentColor';

  public TaskStatus = TaskStatus;
  public ProductType = ProductType;
  public TaskType = TaskType;

}
