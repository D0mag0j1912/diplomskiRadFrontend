import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PovezaniPovijestBolestiComponent } from './povezani-povijest-bolesti.component';

describe('PovezaniPovijestBolestiComponent', () => {
  let component: PovezaniPovijestBolestiComponent;
  let fixture: ComponentFixture<PovezaniPovijestBolestiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PovezaniPovijestBolestiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PovezaniPovijestBolestiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
