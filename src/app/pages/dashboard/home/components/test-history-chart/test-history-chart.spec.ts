import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestHistoryTableComponent } from './test-history-chart';

describe('TestHistoryChart', () => {
  let component: TestHistoryTableComponent;
  let fixture: ComponentFixture<TestHistoryTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHistoryTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestHistoryTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
