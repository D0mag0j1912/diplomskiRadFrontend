import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IzdajReceptComponent } from './izdaj-recept.component';

describe('IzdajReceptComponent', () => {
  let component: IzdajReceptComponent;
  let fixture: ComponentFixture<IzdajReceptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IzdajReceptComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IzdajReceptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
