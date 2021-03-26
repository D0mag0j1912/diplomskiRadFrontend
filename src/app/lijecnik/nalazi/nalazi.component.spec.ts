import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NalaziComponent } from './nalazi.component';

describe('NalaziComponent', () => {
  let component: NalaziComponent;
  let fixture: ComponentFixture<NalaziComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NalaziComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NalaziComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
