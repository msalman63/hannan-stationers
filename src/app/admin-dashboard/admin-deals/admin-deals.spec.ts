import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminDeals } from './admin-deals';

describe('AdminDeals', () => {
  let component: AdminDeals;
  let fixture: ComponentFixture<AdminDeals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminDeals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminDeals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
