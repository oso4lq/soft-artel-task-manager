import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../icon/icon/icon.component';
import { DropdownModule } from 'primeng/dropdown';

interface CategoryOption {
  label: string;
  value: string;
  icon: string;
}

@Component({
  selector: 'app-category-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    DropdownModule,
  ],
  templateUrl: './category-dropdown.component.html',
  styleUrl: './category-dropdown.component.scss'
})
export class CategoryDropdownComponent {

  @Input() categories: CategoryOption[] = [];
  @Input() value: string = 'all';

  @Output() valueChange = new EventEmitter<string>();

  onChange(newValue: string) {
    this.valueChange.emit(newValue);
  }

}
