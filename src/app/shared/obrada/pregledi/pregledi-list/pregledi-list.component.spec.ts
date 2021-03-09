import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreglediListComponent } from './pregledi-list.component';

describe('PreglediListComponent', () => {
  let component: PreglediListComponent;
  let fixture: ComponentFixture<PreglediListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreglediListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PreglediListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
