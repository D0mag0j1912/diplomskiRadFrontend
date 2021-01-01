import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PovijestBolestiComponent } from './povijest-bolesti.component';

describe('PovijestBolestiComponent', () => {
  let component: PovijestBolestiComponent;
  let fixture: ComponentFixture<PovijestBolestiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PovijestBolestiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PovijestBolestiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
