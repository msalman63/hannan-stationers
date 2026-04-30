import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTobacco } from './admin-tobacco';

describe('AdminTobacco', () => {
  let component: AdminTobacco;
  let fixture: ComponentFixture<AdminTobacco>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTobacco]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTobacco);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
