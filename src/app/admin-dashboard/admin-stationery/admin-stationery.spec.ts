import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminStationery } from './admin-stationery';

describe('AdminStationery', () => {
  let component: AdminStationery;
  let fixture: ComponentFixture<AdminStationery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminStationery]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminStationery);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
