import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminSports } from './admin-sports';

describe('AdminSports', () => {
  let component: AdminSports;
  let fixture: ComponentFixture<AdminSports>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSports]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminSports);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
