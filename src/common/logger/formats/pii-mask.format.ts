import { format } from 'winston';

const PII_FIELDS = ['password', 'token', 'authorization', 'cookie', 'creditcard', 'secret'];
const EMAIL_RE = /([a-z0-9._%+-]+)@([a-z0-9.-]+\.[a-z]{2,})/gi;
const REDACTED = '[REDACTED]';

const maskEmails = (value: string): string => value.replace(EMAIL_RE, '$1@***');

const normalizeKey = (key: string): string => key.toLowerCase().replace(/[^a-z0-9]/g, '');

const isPiiField = (key: string): boolean => {
  const normalized = normalizeKey(key);
  return PII_FIELDS.some((f) => normalized.includes(f));
};

const visit = (value: unknown, key: string | undefined, seen: WeakSet<object>): unknown => {
  if (value === null || value === undefined) return value;

  if (typeof value === 'string') {
    if (key && isPiiField(key)) return REDACTED;
    return maskEmails(value);
  }

  if (typeof value !== 'object') return value;

  if (seen.has(value as object)) return value;
  seen.add(value as object);

  if (Array.isArray(value)) {
    return value.map((item) => visit(item, key, seen));
  }

  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    out[k] = isPiiField(k) ? REDACTED : visit(v, k, seen);
  }
  return out;
};

export const piiMaskFormat = format((info) => {
  const seen = new WeakSet<object>();
  const masked = visit(info, undefined, seen) as Record<string, unknown>;
  return masked as typeof info;
});

export const __testing = { visit, isPiiField, maskEmails };
