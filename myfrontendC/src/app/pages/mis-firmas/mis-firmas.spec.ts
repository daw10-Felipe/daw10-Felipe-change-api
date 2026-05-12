import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisFirmas } from './mis-firmas';

describe('MisFirmas', () => {
  let component: MisFirmas;
  let fixture: ComponentFixture<MisFirmas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MisFirmas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisFirmas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
