import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AccountService } from '../../services/account.service';
import { PostService } from 'src/app/services/post.service';
import { Router, ActivatedRoute } from '@angular/router';
import { LoadingService } from '../../services/loading.service';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';
import { User } from 'src/app/model/user';
import { Comment } from 'src/app/model/comment';
import { Post } from 'src/app/model/post';
import { AlertType } from '../../enum/alert-type.enum';

@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css']
})
export class PostDetailComponent implements OnInit, OnDestroy {
  private Subscriptions: Subscription[] = [];
  user = new User();
  posts: Post[] = [];
  host: string;
  userHost: string;
  postHost: string;
  userName: string;
  comment: Comment = new Comment();
  commentList: Array<object> = [];
  post: Post = new Post();
  like: string;
  isUser: boolean;
  postId: number;
  color: string;
  constructor(private http: HttpClient,
              private accountService: AccountService,
              private postService: PostService,
              private router: Router,
              private loadingService: LoadingService,
              private alertService: AlertService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.loadingService.loading.next(true);
    this.comment.content = '';
    this.resolvePost();
  }

  resolvePost(): void {
    const resolvePost: Post = this.route.snapshot.data['resolvedPost'];
    if (resolvePost != null) {
      console.log(resolvePost);
      this.post = resolvePost;
      console.log(this.post);
      this.userHost = this.postService.userHost;
      this.postHost = this.postService.postHost;
      this.host = this.postService.host;
      this.getUserInfo(this.accountService.logginUsername);
      this.loadingService.loading.next(false);
    } else {
      this.loadingService.loading.next(false);
      this.alertService.showAlert('El post no fue encontrado', AlertType.DANGER);
      this.router.navigateByUrl('/home');
    }
  }
  getUserInfo(logginUsername: string) {
    this.Subscriptions.push(
      this.accountService.getUserInformation(logginUsername).subscribe((response: User) => {
        this.displayLike(response);
        this.user = response;
        console.log(response);
      }, error => {
        console.log(error);
      })
    );
  }

  displayLike(user: User) {
    const result: Post = user.likedPost.find(post => post.id === this.post.id);
    if (result) {
      this.like = 'Unlike';
      this.color = '#18BC9C';
    } else {
      this.like = 'Like';
      this.color = '#000000';
    }
  }

  likePost(post, user) {
    if (this.color === '#000000') {
      this.color = '#18BC9C';
      this.like = 'Unlike';
      this.doLike(post, user);
      post.likes += 1;
    } else {
      this.color = '#000000';
      this.like = 'Like';
      this.doUnlike(post, user);
      if (user.likedPosts != null) {
        for (let i = 0; i < user.likedPosts.length; i++) {
          if (user.likedPosts[i].id === post.id) {
            user.likedPosts.splice(i, 1);
          }
        }
      }
      if (post.likes > 0) {
        this.post.likes -= 1;
      }
    }
  }

  getUserProfile(username: string) {
    this.router.navigate(['/profile', username]);
  }

  onDelete(id: number) {
    this.Subscriptions.push(
      this.postService.deletePost(id).subscribe(response => {
        console.log(response);
        this.alertService.showAlert('Post borrado', AlertType.SUCCESS);
        this.router.navigateByUrl('/home');
      }, error => {
        console.log(error);
        this.alertService.showAlert('ha ocurrido un error intentalo mas tarde', AlertType.DANGER);
      })
    );
  }

  onAddComment(comment, post: Post) {
    this.comment.content = '';
    const newComment: Comment = new Comment();
    newComment.content = comment.value.content;
    newComment.postId = comment.value.postId;
    newComment.postedDate = new Date();
    newComment.username = comment.value.username;
    console.log(newComment);
    post.commentsList.push(newComment);
    this.Subscriptions.push(
      this.postService.saveComment(newComment).subscribe(
        response => {
          console.log(response);
          console.log('Comentario agregado');
        },
        error => {
          this.loadingService.loading.next(false);
          console.log(error);
        }
      )
    );
  }
  doLike(post, user) {
    this.Subscriptions.push(
      this.postService.like(post.id, user.username).subscribe(
        response => {
          console.log(response);
        },
        error => {
          console.log(error);
        }
      )
    );
  }
  doUnlike(post, user) {
    this.Subscriptions.push(
      this.postService.unLike(post.id, user.username).subscribe(
        response => {
          console.log(response);
        },
        error => {
          console.log(error);
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.Subscriptions.forEach(sub => sub.unsubscribe());
  }
}
