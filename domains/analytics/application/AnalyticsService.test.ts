import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AnalyticsService } from './AnalyticsService';

test('groupEventsByDate counts views and clicks separately', async () => {
  const events = [
    { type: 'view', createdAt: new Date('2024-01-01') },
    { type: 'click', createdAt: new Date('2024-01-01') },
    { type: 'view', createdAt: new Date('2024-01-02') },
  ];

  const repo = {
    findEventsByUserId: async () => events,
  } as any;

  const service = new AnalyticsService(repo);
  const result = await service.getUserAnalytics('user-id', 7);

  assert.equal(result.totalViews, 2);
  assert.equal(result.totalClicks, 1);
  assert.deepEqual(result.eventsOverTime, {
    '2024-01-01': { views: 1, clicks: 1 },
    '2024-01-02': { views: 1, clicks: 0 },
  });
});
