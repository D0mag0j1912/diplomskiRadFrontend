import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { IzdaniReceptiComponent } from './izdani-recepti.component';

describe('IzdaniReceptiComponent', () => {
  let component: IzdaniReceptiComponent;
  let fixture: ComponentFixture<IzdaniReceptiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IzdaniReceptiComponent ],
      imports: [RouterTestingModule,HttpClientTestingModule]
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
