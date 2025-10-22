import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestHistoryChart } from './test-history-chart';

describe('TestHistoryChart', () => {
  let component: TestHistoryChart;
  let fixture: ComponentFixture<TestHistoryChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHistoryChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestHistoryChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
