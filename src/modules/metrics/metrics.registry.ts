import { Counter, Histogram, register } from 'prom-client';

export const HTTP_REQUEST_DURATION = 'http_request_duration_seconds';
export const GRAPHQL_RESOLVER_DURATION = 'graphql_resolver_duration_seconds';
export const RABBITMQ_MESSAGES_TOTAL = 'rabbitmq_messages_total';

const ensureHistogram = (
  name: string,
  help: string,
  labelNames: string[],
  buckets: number[],
): Histogram<string> => {
  const existing = register.getSingleMetric(name) as Histogram<string> | undefined;
  if (existing) return existing;
  return new Histogram({ name, help, labelNames, buckets });
};

const ensureCounter = (name: string, help: string, labelNames: string[]): Counter<string> => {
  const existing = register.getSingleMetric(name) as Counter<string> | undefined;
  if (existing) return existing;
  return new Counter({ name, help, labelNames });
};

export const httpRequestDuration = ensureHistogram(
  HTTP_REQUEST_DURATION,
  'HTTP request duration in seconds',
  ['method', 'route', 'status'],
  [0.05, 0.1, 0.3, 0.5, 1, 3, 10],
);

export const graphqlResolverDuration = ensureHistogram(
  GRAPHQL_RESOLVER_DURATION,
  'GraphQL resolver duration in seconds',
  ['type', 'field', 'status'],
  [0.01, 0.05, 0.1, 0.3, 1, 3],
);

export const rabbitmqMessagesTotal = ensureCounter(
  RABBITMQ_MESSAGES_TOTAL,
  'RabbitMQ messages count',
  ['direction', 'routing_key', 'status'],
);
