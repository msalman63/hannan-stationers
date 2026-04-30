import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminGrocery } from './admin-grocery';

describe('AdminGrocery', () => {
  let component: AdminGrocery;
  let fixture: ComponentFixture<AdminGrocery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminGrocery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminGrocery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
