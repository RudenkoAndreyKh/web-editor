import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenedFilesComponent } from './opened-files.component';

describe('OpenedFilesComponent', () => {
  let component: OpenedFilesComponent;
  let fixture: ComponentFixture<OpenedFilesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenedFilesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenedFilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
