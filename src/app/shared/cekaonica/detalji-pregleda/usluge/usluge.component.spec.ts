import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UslugeComponent } from './usluge.component';

describe('UslugeComponent', () => {
  let component: UslugeComponent;
  let fixture: ComponentFixture<UslugeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UslugeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UslugeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
