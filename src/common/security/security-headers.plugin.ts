import { ApolloServerPlugin, BaseContext, GraphQLRequestContext } from '@apollo/server';
import { Response } from 'express';

interface CustomContext extends BaseContext {
  res?: Response;
}

export const SecurityHeadersPlugin: ApolloServerPlugin = {
  async requestDidStart() {
    return {
      async willSendResponse(requestContext: GraphQLRequestContext<CustomContext>) {
        if (requestContext.contextValue?.res) {
          requestContext.contextValue.res.setHeader('X-GraphQL-Security', 'enabled');
          requestContext.contextValue.res.setHeader('X-Content-Type-Options', 'nosniff');
          requestContext.contextValue.res.setHeader('X-Frame-Options', 'DENY');
          requestContext.contextValue.res.setHeader('Referrer-Policy', 'same-origin');
          requestContext.contextValue.res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
          requestContext.contextValue.res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
          requestContext.contextValue.res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
        }
      },
    };
  },
};
