import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { UputnicaComponent } from './uputnica.component';

describe('UputnicaComponent', () => {
  let component: UputnicaComponent;
  let fixture: ComponentFixture<UputnicaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UputnicaComponent ],
      imports: [RouterTestingModule,HttpClientTestingModule]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UputnicaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
