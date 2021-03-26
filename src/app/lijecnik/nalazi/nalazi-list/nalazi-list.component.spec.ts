import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NalaziListComponent } from './nalazi-list.component';

describe('NalaziListComponent', () => {
  let component: NalaziListComponent;
  let fixture: ComponentFixture<NalaziListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NalaziListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NalaziListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
