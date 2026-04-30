import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StationeryComponent } from './stationery-component';

describe('StationeryComponent', () => {
  let component: StationeryComponent;
  let fixture: ComponentFixture<StationeryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StationeryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StationeryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
