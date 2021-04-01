import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UputnicaComponent } from './uputnica.component';

describe('UputnicaComponent', () => {
  let component: UputnicaComponent;
  let fixture: ComponentFixture<UputnicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UputnicaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UputnicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
