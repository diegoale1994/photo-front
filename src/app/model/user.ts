import { Post } from './post';

export class User {
    id: number;
    name: string;
    username: string;
    email: Date;
    password: string;
    bio: string;
    post: Post[];
    likedPost: Post[];
}
