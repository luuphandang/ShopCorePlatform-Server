import { ApolloServerPlugin, BaseContext, GraphQLRequestContext } from '@apollo/server';
import { Response } from 'express';

import { getRequestContext } from '@/common/contexts/request.context';

interface ResContext extends BaseContext {
  res?: Response;
}

export const RequestIdPlugin: ApolloServerPlugin = {
  async requestDidStart() {
    return {
      async willSendResponse(requestContext: GraphQLRequestContext<ResContext>) {
        const ctx = getRequestContext();
        if (ctx?.requestId && requestContext.contextValue?.res) {
          requestContext.contextValue.res.setHeader('x-request-id', ctx.requestId);
        }
      },
    };
  },
};
