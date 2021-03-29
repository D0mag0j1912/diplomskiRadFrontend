import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NalaziDetailComponent } from './nalazi-detail.component';

describe('NalaziDetailComponent', () => {
  let component: NalaziDetailComponent;
  let fixture: ComponentFixture<NalaziDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NalaziDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NalaziDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
