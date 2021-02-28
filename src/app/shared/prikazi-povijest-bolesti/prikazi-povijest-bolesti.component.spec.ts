import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrikaziPovijestBolestiComponent } from './prikazi-povijest-bolesti.component';

describe('PrikaziPovijestBolestiComponent', () => {
  let component: PrikaziPovijestBolestiComponent;
  let fixture: ComponentFixture<PrikaziPovijestBolestiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrikaziPovijestBolestiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrikaziPovijestBolestiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
