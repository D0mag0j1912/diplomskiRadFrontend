import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IzdaniReceptiComponent } from './izdani-recepti.component';

describe('IzdaniReceptiComponent', () => {
  let component: IzdaniReceptiComponent;
  let fixture: ComponentFixture<IzdaniReceptiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IzdaniReceptiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IzdaniReceptiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
