import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [], 
  template: `
  <svg class="icon" [attr.width]="width" [attr.height]="height" aria-hidden="true">
    <use [attr.href]="'#' + iconId"></use>
  </svg>
`,
  styles: [`
  .icon {
    display: inline-block;
    fill: currentColor;
    /* width: 1em;
    height: 1em; */
  }
`]
})
export class IconComponent {

  @Input() iconId!: string;
  @Input() width: string | number = '16';
  @Input() height: string | number = '16';

}
