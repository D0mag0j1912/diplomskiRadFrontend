import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PacijentiComponent } from './pacijenti.component';

describe('PacijentiComponent', () => {
  let component: PacijentiComponent;
  let fixture: ComponentFixture<PacijentiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PacijentiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PacijentiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
