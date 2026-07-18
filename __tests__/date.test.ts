import { getTodayISODate } from '@/utils/date';

describe('getTodayISODate', () => {
  it('returns a YYYY-MM-DD formatted date', () => {
    expect(getTodayISODate()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
