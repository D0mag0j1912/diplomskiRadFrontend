import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { IzdaneUputniceComponent } from './izdane-uputnice.component';

describe('IzdaneUputniceComponent', () => {
  let component: IzdaneUputniceComponent;
  let fixture: ComponentFixture<IzdaneUputniceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IzdaneUputniceComponent ],
      imports: [RouterTestingModule,HttpClientTestingModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IzdaneUputniceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
