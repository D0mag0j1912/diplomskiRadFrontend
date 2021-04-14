import { ComponentFixture, TestBed } from '@angular/core/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';

import { NalaziComponent } from './nalazi.component';

describe('NalaziComponent', () => {
  let component: NalaziComponent;
  let fixture: ComponentFixture<NalaziComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NalaziComponent ],
      imports: [RouterTestingModule,HttpClientTestingModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NalaziComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
