import DataLoader from 'dataloader';
import { MemberType, Post, PrismaClient, Profile, SubscribersOnAuthors, User } from '@prisma/client';
import { ILoaders } from '../models/interfaces.js';

export function createLoaders(prisma: PrismaClient): ILoaders {
  const memberTypeLoader = new DataLoader<string, MemberType | null>(async (keys) => {
    const memberTypes: MemberType[] = await prisma.memberType.findMany({
      where: { id: { in: keys as string[] } },
    });
    const memberTypeMap: Map<string, MemberType> = new Map();
    memberTypes.forEach((memberType: MemberType) => {
      memberTypeMap.set(memberType.id, memberType);
    });
    return keys.map((key) => memberTypeMap.get(key) ?? null);
  });

  const profileLoader = new DataLoader<string, Profile | null>(async (keys) => {
    const profiles: Profile[] = await prisma.profile.findMany({
      where: { userId: { in: keys as string[] } },
    });
    const profileMap: Map<string, Profile> = new Map();
    profiles.forEach((profile: Profile) => {
      profileMap.set(profile.userId, profile);
    });
    return keys.map((key: string) => profileMap.get(key) ?? null);
  });

  const postLoader = new DataLoader<string, Post[] | null>(async (keys) => {
    const posts: Post[] = await prisma.post.findMany({
      where: { authorId: { in: keys as string[] } }
    });
    const postMap: Map<string, Post[]> = new Map();
    posts.forEach((post:Post) => {
      if (!postMap.has(post.authorId)) {
        postMap.set(post.authorId, []);
      }
      postMap.get(post.authorId)?.push(post);
    });
    return keys.map((key: string) => postMap.get(key) ?? null);
  });

  const userLoader = new DataLoader<string, User | null>(async (keys) => {
    const users: User[] = await prisma.user.findMany({
      where: { id: { in: keys as string[] } },
    });
    const userMap: Map<string, User> = new Map();
    users.forEach((user: User) => {
      userMap.set(user.id, user);
    });
    return keys.map((key: string) => userMap.get(key) ?? null);
  });


  const userSubscribedToLoader = new DataLoader<string, SubscribersOnAuthors[] | null>(async (keys) => {
    const subscriptions: SubscribersOnAuthors[] = await prisma.subscribersOnAuthors.findMany({
      where: { subscriberId: { in: keys as string[] } },
    });
    const subscriptionsMap: Map<string, SubscribersOnAuthors[]> = new Map();
    subscriptions.forEach((subscription: SubscribersOnAuthors) => {
      if (!subscriptionsMap.has(subscription.subscriberId)) {
        subscriptionsMap.set(subscription.subscriberId, []);
      }
      subscriptionsMap.get(subscription.subscriberId)?.push(subscription);
    });
    return keys.map((key) => subscriptionsMap.get(key) ?? null);
  });

  const subscribedToUserLoader = new DataLoader<string, SubscribersOnAuthors[] | null>(async (keys) => {
    const subscriptions: SubscribersOnAuthors[] = await prisma.subscribersOnAuthors.findMany({
      where: { authorId: { in: keys as string[] } },
    });
    const subscriptionsMap: Map<string, SubscribersOnAuthors[]> = new Map();
    subscriptions.forEach((subscription) => {
      if (!subscriptionsMap.has(subscription.authorId)) {
        subscriptionsMap.set(subscription.authorId, []);
      }
      subscriptionsMap.get(subscription.authorId)?.push(subscription);
    });
    return keys.map((key: string) => subscriptionsMap.get(key) ?? null);
  });

  return {
    memberTypeLoader,
    postLoader,
    userSubscribedToLoader,
    subscribedToUserLoader,
    userLoader,
    profileLoader,
  };
}
