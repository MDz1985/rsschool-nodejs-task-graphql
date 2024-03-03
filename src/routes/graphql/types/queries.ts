import { GraphQLBoolean, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql/index.js';
import { GraphQLFloat } from 'graphql/type/scalars.js';
import { UUIDType } from './uuid.js';




export const memberTypeInterface = new GraphQLObjectType({
  name: 'MemberType',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    discount: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    postsLimitPerMonth: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
  })
});

export const postInterface = new GraphQLObjectType({
  name: 'Post',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
    },
    authorId: {
      type: new GraphQLNonNull(GraphQLString),
    },
  })
});

export const profileInterface = new GraphQLObjectType({
  name: 'Profile',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    isMale: {
      type: new GraphQLNonNull(GraphQLBoolean),
    },
    yearOfBirth: {
      type: new GraphQLNonNull(GraphQLInt),
    },
    userId: {
      type: new GraphQLNonNull(GraphQLString),
    },
    memberTypeId: {
      type: new GraphQLNonNull(GraphQLString),
    },
    memberType: {
      type: memberTypeInterface,
      resolve: async (parent: { memberTypeId: string }, args, context) => {
        return context.memberTypeLoader.load(parent.memberTypeId);
      },
      // resolve: async (parent: { memberTypeId: string }, _, context) => {
      //   return await context.prisma.memberType.findUnique({ where: { id: parent.memberTypeId } });
      // }
    },
  })
});

export const subscribedToInterface = new GraphQLObjectType({
  name: 'SubscribedToUser',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    userSubscribedTo: {
      type: new GraphQLList(userInterface),
      resolve: async (source: { id: string },_, context) => {
        const subscriptions = await context.prisma.subscribersOnAuthors?.findMany();
        return Promise.all(subscriptions?.filter(({ subscriberId }) => subscriberId === source?.id)
          .map(({ authorId }) => context.prisma.user.findUnique({ where: { id: authorId } }))
        );
      }
    },
    subscribedToUser: {
      type: new GraphQLList(userInterface),
      resolve: async (source: { id: string },_, context) => {
        const subscriptions = await context.prisma.subscribersOnAuthors?.findMany();
        return Promise.all(subscriptions?.filter(({ authorId }) => authorId === source?.id)
          .map(({ subscriberId }) => context.prisma.user.findUnique({ where: { id: subscriberId } }))
        );
      }
    }
  })
});

export const userSubscribedToInterface = new GraphQLObjectType({
  name: 'UserSubscribedTo',
  fields: () => ({
    id: { type: new GraphQLNonNull(UUIDType) },
    name: { type: new GraphQLNonNull(GraphQLString) },
    balance: { type: new GraphQLNonNull(GraphQLFloat) },
    userSubscribedTo: {
      type: new GraphQLList(userInterface),
      resolve: async (source: { id: string }, _,context) => {
        const subscriptions = await context.prisma.subscribersOnAuthors?.findMany();
        return Promise.all(subscriptions?.filter(({ subscriberId }) => subscriberId === source?.id)
          .map(({ authorId }) => context.prisma.user.findUnique({ where: { id: authorId } }))
        );
      }
    },
    subscribedToUser: {
      type: new GraphQLList(userInterface),
      resolve: async (source: { id: string },_,context) => {
        const subscriptions = await context.prisma.subscribersOnAuthors?.findMany();
        return Promise.all(subscriptions?.filter(({ authorId }) => authorId === source?.id)
          .map(({ subscriberId }) => context.prisma.user.findUnique({ where: { id: subscriberId } }))
        );
      }
    }
  })
});
export const userInterface = new GraphQLObjectType({
  name: 'User',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    name: {
      type: new GraphQLNonNull(GraphQLString),
    },
    balance: {
      type: new GraphQLNonNull(GraphQLFloat),
    },
    profile: {
      type: profileInterface,
      resolve: async (parent: { id: string }, _, context) => {
        return await context.prisma.profile.findUnique({ where: { userId: parent.id } });
      }
    },
    posts: {
      type: new GraphQLList(postInterface),
      resolve: async (parent,args,context) => {
        return await context.prisma.post.findMany({ where: { authorId: parent.id } });
      }
    },
    userSubscribedTo: {
      type: new GraphQLList(userSubscribedToInterface),
      resolve: async (parent: { id: string },_, context) => {
        const subscriptions = await context.subscribersOnAuthorsLoader.load(parent.id);
        if (!subscriptions) return [];
        return Promise.all(subscriptions.map(({ authorId }) => context.userLoader.load(authorId) ))
        // const subscriptions = await context.prisma.subscribersOnAuthors?.findMany();
        // return Promise.all(subscriptions?.filter(({ subscriberId }) => subscriberId === parent.id)
        //   .map(({ authorId }) => context.prisma.user.findUnique({ where: { id: authorId } }))
        // );
      }
    },
    subscribedToUser: {
      type: new GraphQLList(subscribedToInterface),
      resolve: async (parent: { id: string },_,context) => {
        const subscriptions = await context.userSubscribersOnAuthorsLoader.load(parent.id);
        if (!subscriptions) return [];
        return Promise.all(subscriptions.map(({ subscriberId }) => context.userLoader.load(subscriberId)));
        // const subscriptions = await context.prisma.subscribersOnAuthors?.findMany();
        // return Promise.all(subscriptions?.filter(({ authorId }) => authorId === parent.id)
        //   .map(({ subscriberId }) => context.prisma.user.findUnique({ where: { id: subscriberId } }))
        // );
      }
    }
  })
});
