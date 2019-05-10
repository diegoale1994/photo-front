import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Post } from '../model/post';
import { Observable } from 'rxjs';
import { PostService } from './post.service';

@Injectable({
  providedIn: 'root'
})
export class PostResolverService implements Resolve<Post> {
  constructor(private postService: PostService) { }

  resolve(route: import('@angular/router').ActivatedRouteSnapshot): Observable<Post> {
    const postId: number = route.params['postId'];
    return this.postService.getPostById(postId);
  }
}
