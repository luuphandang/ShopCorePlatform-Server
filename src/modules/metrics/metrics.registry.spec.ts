import { register } from 'prom-client';

import {
  GRAPHQL_RESOLVER_DURATION,
  graphqlResolverDuration,
  HTTP_REQUEST_DURATION,
  httpRequestDuration,
  RABBITMQ_MESSAGES_TOTAL,
  rabbitmqMessagesTotal,
} from './metrics.registry';

describe('metrics.registry', () => {
  it('registers HTTP histogram with bounded label set', () => {
    expect(register.getSingleMetric(HTTP_REQUEST_DURATION)).toBe(httpRequestDuration);
  });

  it('registers GraphQL histogram', () => {
    expect(register.getSingleMetric(GRAPHQL_RESOLVER_DURATION)).toBe(graphqlResolverDuration);
  });

  it('registers RabbitMQ counter', () => {
    expect(register.getSingleMetric(RABBITMQ_MESSAGES_TOTAL)).toBe(rabbitmqMessagesTotal);
  });
});
