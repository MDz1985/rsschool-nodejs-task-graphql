import { GraphQLList, GraphQLObjectType } from 'graphql/index.js';
import { memberTypeInterface, postInterface, profileInterface, userInterface } from './types/queries.js';
import { memberTypeId, UUIDType } from './types/uuid.js';
import { IContext } from './models/interfaces.js';

export const myQueryType = new GraphQLObjectType({
  name: 'Query',
  fields: () => ({
    memberTypes: {
      type: new GraphQLList(memberTypeInterface),
      resolve: (_,__,context: IContext) => context.prisma.memberType.findMany()
    },
    memberType: {
      type: memberTypeInterface,
      args: {
        id: {
          type: memberTypeId
        }
      },
      resolve: (_, args: { id: string }, context: IContext) =>
        context.prisma.memberType.findUnique({ where: { id: args.id } })
    },
    posts: {
      type: new GraphQLList(postInterface),
      resolve: (_,__,context: IContext) => context.prisma.post.findMany()
    },
    post: {
      type: postInterface,
      args: {
        id: {
          type: UUIDType
        }
      },
      resolve: async (_, args: { id: string }, context: IContext) => await context.prisma.post.findUnique({ where: { id: args.id } })
    },

    users: {
      type: new GraphQLList(userInterface),
      resolve: async(_, __, context: IContext) => {
        const users = await context.prisma.user.findMany();
        users.forEach((user) => {
          context.userLoader.prime(user.id, user);
        })
        return users;
      }
    },
    user: {
      type: userInterface,
      args: {
        id: {
          type: UUIDType
        }
      },
      resolve: async (_, args: { id: string }, context: IContext) => {
        return context.userLoader.load(args.id);
      }
    },
    profiles: {
      type: new GraphQLList(profileInterface),
      resolve: (_,__,context: IContext) => context.prisma.profile.findMany()
    },
    profile: {
      type: profileInterface,
      args: {
        id: {
          type: UUIDType
        }
      },
      resolve: async (_, args: { id: string }, context: IContext) =>
        await context.prisma.profile.findUnique({ where: { id: args.id } })
    },
  }),
});
