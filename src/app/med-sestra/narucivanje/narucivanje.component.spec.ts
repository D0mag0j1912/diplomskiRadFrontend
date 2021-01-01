import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NarucivanjeComponent } from './narucivanje.component';

describe('NarucivanjeComponent', () => {
  let component: NarucivanjeComponent;
  let fixture: ComponentFixture<NarucivanjeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NarucivanjeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NarucivanjeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
