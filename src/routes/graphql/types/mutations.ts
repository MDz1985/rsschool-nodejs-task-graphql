import { GraphQLBoolean, GraphQLInputObjectType, GraphQLInt, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql/index.js';
import { memberTypeId, UUIDType } from './uuid.js';
import { GraphQLFloat } from 'graphql/type/scalars.js';

export const userInputType = new GraphQLInputObjectType({
  name: 'CreateUserInput',
  fields: () => ({
    name: { type: new GraphQLNonNull(UUIDType) },
    balance: { type: new GraphQLNonNull(GraphQLFloat), }
  })
});

export const postInputType = new GraphQLInputObjectType({
  name: 'CreatePostInput',
  fields: () => ({
    authorId: {
      type: new GraphQLNonNull(UUIDType),
    },
    content: { type: new GraphQLNonNull(GraphQLString) },
    title: { type: new GraphQLNonNull(GraphQLString) }
  })
});

export const profileInputType = new GraphQLInputObjectType({
  name: 'CreateProfileInput',
  fields: () => ({
    userId: { type: UUIDType },
    memberTypeId: { type: new GraphQLNonNull(memberTypeId) },
    isMale: { type: new GraphQLNonNull(GraphQLBoolean) },
    yearOfBirth: { type: new GraphQLNonNull(GraphQLInt) },
  })
});

export const changeUserInputType = new GraphQLInputObjectType({
  name: 'ChangeUserInput',
  fields: () => ({
    name: { type: GraphQLString },
    balance: { type: GraphQLFloat, }
  })
});

export const changePostInputType = new GraphQLInputObjectType({
  name: 'ChangePostInput',
  fields: () => ({
    content: { type: GraphQLString },
    title: { type: GraphQLString }
  })
});

export const changeProfileInputType = new GraphQLInputObjectType({
  name: 'ChangeProfileInput',
  fields: () => ({
    isMale: { type: GraphQLBoolean },
    yearOfBirth: { type: GraphQLInt },
  })
});

export const changePostResultType = new GraphQLObjectType({
  name: 'ChangePostResult',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(UUIDType),
    },
    title: {
      type: new GraphQLNonNull(GraphQLString),
    },
    content: {
      type: new GraphQLNonNull(GraphQLString),
    },
    authorId: {
      type: new GraphQLNonNull(UUIDType),
    },
  })
});

export const changeProfileResultType = new GraphQLObjectType({
  name: 'ChangeProfileResult',
  fields: () => ({
    id: { type: UUIDType }
  }),
});

export const changeUserResultType = new GraphQLObjectType({
  name: 'ChangeUserResult',
  fields: () => ({
    id: { type: UUIDType }
  }),
});

export const subscribeResult = new GraphQLObjectType({
  name: 'SubscribeResult',
  fields: () => ({
    id: { type: UUIDType },
  }),
});
