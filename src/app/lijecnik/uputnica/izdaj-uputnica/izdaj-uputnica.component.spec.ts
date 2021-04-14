import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { IzdajUputnicaComponent } from './izdaj-uputnica.component';

describe('IzdajUputnicaComponent', () => {
  let component: IzdajUputnicaComponent;
  let fixture: ComponentFixture<IzdajUputnicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IzdajUputnicaComponent ],
      imports: [RouterTestingModule,HttpClientTestingModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IzdajUputnicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
