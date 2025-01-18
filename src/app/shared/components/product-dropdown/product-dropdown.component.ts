import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { IconComponent } from '../../icon/icon/icon.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface ProductOption {
  label: string;
  value: string;
  icon?: string;
}

@Component({
  selector: 'app-product-dropdown',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    DropdownModule,
  ],
  templateUrl: './product-dropdown.component.html',
  styleUrl: './product-dropdown.component.scss'
})
export class ProductDropdownComponent {

  @Input() productOptions: ProductOption[] = [];
  @Input() value: string = 'all';

  @Output() valueChange = new EventEmitter<string>();

  onChange(newValue: string) {
    this.valueChange.emit(newValue);
  }
  
}
