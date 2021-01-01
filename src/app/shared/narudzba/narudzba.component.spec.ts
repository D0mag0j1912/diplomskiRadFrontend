import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NarudzbaComponent } from './narudzba.component';

describe('NarudzbaComponent', () => {
  let component: NarudzbaComponent;
  let fixture: ComponentFixture<NarudzbaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NarudzbaComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NarudzbaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
