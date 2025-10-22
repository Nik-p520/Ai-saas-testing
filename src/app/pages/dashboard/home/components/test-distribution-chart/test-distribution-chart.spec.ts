import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestDistributionChart } from './test-distribution-chart';

describe('TestDistributionChart', () => {
  let component: TestDistributionChart;
  let fixture: ComponentFixture<TestDistributionChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestDistributionChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestDistributionChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
