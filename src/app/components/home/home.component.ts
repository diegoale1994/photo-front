import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AccountService } from 'src/app/services/account.service';
import { Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { Subscription } from 'rxjs';
import { AlertType } from '../../enum/alert-type.enum';
import { User } from 'src/app/model/user';
import { Post } from 'src/app/model/post';
import { PostService } from 'src/app/services/post.service';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  user = new User();
  posts: Post[] = [];
  host: string;
  userHost: string;
  postHost: string;
  constructor(private alertService: AlertService, private accountService: AccountService, private router: Router,
              private loadingService: LoadingService, private postService: PostService) { }

  ngOnInit() {

  }

  getUserInfo(username: string): void {
    this.subscriptions.push(
      this.accountService.getUserInformation(username).subscribe((response: User) => {
        this.user = response;
      }, error => {
        console.log(error);
        this.user = null;
        this.logOut();
        this.router.navigateByUrl('/login');
      })
    );
  }
  logOut() {
   this.accountService.logOut();
   this.router.navigateByUrl('/login');
   this.alertService.showAlert('Necesitas entrar a la aplicacion para ver esta pagina', AlertType.DANGER);
  }

  getUserProfile(username: string): void {
    this.router.navigate(['/profile', username]);
    console.log(username);
  }

  getPosts(): void {
    this.subscriptions.push(
      this.accountService.getPosts().subscribe((response: Post[]) => {
        this.posts = response;
        console.log(this.posts);
        this.loadingService.loading.next(false);
      }, error => {
        console.log(error);
        this.loadingService.loading.next(false);
      })
    );
  }

  onDelete(id: number) {
    this.subscriptions.push(
      this.postService.deletePost(id).subscribe(response => {
        console.log(response);
        this.alertService.showAlert('Post borrado', AlertType.SUCCESS);
        this.getPosts();
      }, error => {
        console.log(error);
        this.alertService.showAlert('ha ocurrido un error intentalo mas tarde', AlertType.DANGER);
        this.getPosts();
      })
    );
  }

  seeOnePost(postId): void {
    this.router.navigate(['/post', postId]);
    console.log(postId);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
