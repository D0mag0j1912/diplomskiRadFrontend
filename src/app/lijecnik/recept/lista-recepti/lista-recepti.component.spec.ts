import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaReceptiComponent } from './lista-recepti.component';

describe('ListaReceptiComponent', () => {
  let component: ListaReceptiComponent;
  let fixture: ComponentFixture<ListaReceptiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaReceptiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaReceptiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
