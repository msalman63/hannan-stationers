import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-modal',
  imports: [],
  templateUrl: './modal.html',
  styleUrl: './modal.css',
})
export class Modal {
  //Its a property that parent controls, when its true modal shows up!
  isOpen = input(false);
  //an event modal emits when it should close
  closed = output<void>();
  closeModal(){
    this.closed.emit();
  }
}
