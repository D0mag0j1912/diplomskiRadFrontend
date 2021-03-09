import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreglediDetailComponent } from './pregledi-detail.component';

describe('PreglediDetailComponent', () => {
  let component: PreglediDetailComponent;
  let fixture: ComponentFixture<PreglediDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreglediDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreglediDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
