import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrikazReceptComponent } from './prikaz-recept.component';

describe('PrikazReceptComponent', () => {
  let component: PrikazReceptComponent;
  let fixture: ComponentFixture<PrikazReceptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrikazReceptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrikazReceptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
