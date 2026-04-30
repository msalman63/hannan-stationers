import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TobaccoComponent } from './tobacco-component';

describe('TobaccoComponent', () => {
  let component: TobaccoComponent;
  let fixture: ComponentFixture<TobaccoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TobaccoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TobaccoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
