import { ComponentFixture, TestBed } from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import { PovezaniPovijestBolestiComponent } from './povezani-povijest-bolesti.component';

describe('PovezaniPovijestBolestiComponent', () => {
  let component: PovezaniPovijestBolestiComponent;
  let fixture: ComponentFixture<PovezaniPovijestBolestiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PovezaniPovijestBolestiComponent ],
      imports: [RouterTestingModule,HttpClientTestingModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PovezaniPovijestBolestiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
