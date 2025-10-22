import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestTrendsChart } from './test-trends-chart';

describe('TestTrendsChart', () => {
  let component: TestTrendsChart;
  let fixture: ComponentFixture<TestTrendsChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestTrendsChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestTrendsChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
