import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UzorciComponent } from './uzorci.component';

describe('UzorciComponent', () => {
  let component: UzorciComponent;
  let fixture: ComponentFixture<UzorciComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UzorciComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UzorciComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
