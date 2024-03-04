import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import { GraphQLSchema } from 'graphql/index.js';
import { myQueryType } from './query.js';
import { myMutationType } from './mutations.js';
import { createLoaders } from './loaders/loaders.js';
import { ILoaders } from './models/interfaces.js';
import depthLimit from 'graphql-depth-limit';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  const ProjectSchema: GraphQLSchema = new GraphQLSchema({
    query: myQueryType,
    mutation: myMutationType
  });

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },

    async handler(req) {
      const { query, variables } = req.body;
      const validationError = validate(ProjectSchema, parse(query), [depthLimit(5)]);
      if (validationError?.length) return { errors: validationError };

      const loaders: ILoaders = createLoaders(prisma);

      const result = await graphql({
        schema: ProjectSchema,
        source: query,
        variableValues: variables,
        contextValue: { ...loaders, prisma },
      });

      return {
        data: result.data,
        errors: result.errors,
      };
    },
  });
};

export default plugin;
