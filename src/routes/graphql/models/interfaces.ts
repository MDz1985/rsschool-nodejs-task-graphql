import { MemberType, Post, PrismaClient, Profile, SubscribersOnAuthors, User } from '@prisma/client';
import DataLoader from 'dataloader';

export interface ILoaders {
  memberTypeLoader: DataLoader<string, MemberType | null>;
  postLoader: DataLoader<string, Post[] | null>;
  userSubscribedToLoader: DataLoader<string, SubscribersOnAuthors[] | null>;
  subscribedToUserLoader: DataLoader<string, SubscribersOnAuthors[]  | null>;
  userLoader: DataLoader<string, User | null>;
  profileLoader: DataLoader<string, Profile | null>;

}

export interface IContext extends ILoaders {
  prisma: PrismaClient;
}
