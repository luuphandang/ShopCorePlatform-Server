import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import sanitizeHtml from 'sanitize-html';
import { Observable } from 'rxjs';

import { ALLOW_HTML_KEY } from '../decorators/allow-html.decorator';

const RICH_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    'p',
    'br',
    'strong',
    'b',
    'em',
    'i',
    'u',
    'ul',
    'ol',
    'li',
    'a',
    'img',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'pre',
    'code',
    'span',
    'div',
    'table',
    'thead',
    'tbody',
    'tr',
    'th',
    'td',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'width', 'height'],
    '*': ['class', 'style'],
  },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesByTag: {
    img: ['http', 'https', 'data'],
  },
};

const PLAIN_TEXT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

@Injectable()
export class SanitizeInterceptor implements NestInterceptor {
  public intercept(context: ExecutionContext, next: CallHandler<unknown>): Observable<unknown> {
    const gqlContext = GqlExecutionContext.create(context);
    const args = gqlContext.getArgs();

    if (args?.input) {
      this.sanitizeObject(args.input);
    }

    if (args?.data) {
      this.sanitizeObject(args.data);
    }

    return next.handle();
  }

  private sanitizeObject(obj: Record<string, unknown>): void {
    if (!obj || typeof obj !== 'object') return;

    const constructor = obj.constructor;
    const allowHtmlFields: (string | symbol)[] =
      Reflect.getMetadata(ALLOW_HTML_KEY, constructor) ?? [];

    for (const key of Object.keys(obj)) {
      const value = obj[key];

      if (typeof value === 'string') {
        const isRichText = allowHtmlFields.includes(key);
        obj[key] = sanitizeHtml(value, isRichText ? RICH_TEXT_OPTIONS : PLAIN_TEXT_OPTIONS);
      } else if (Array.isArray(value)) {
        value.forEach((item) => {
          if (typeof item === 'string') return;
          if (item && typeof item === 'object') {
            this.sanitizeObject(item as Record<string, unknown>);
          }
        });
      } else if (value && typeof value === 'object') {
        this.sanitizeObject(value as Record<string, unknown>);
      }
    }
  }
}
