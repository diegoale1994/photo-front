import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/services/alert.service';
import { LoadingService } from 'src/app/services/loading.service';
import { PostService } from 'src/app/services/post.service';
import { AccountService } from 'src/app/services/account.service';
import { Subscription } from 'rxjs';
import { User } from 'src/app/model/user';
import { Post } from 'src/app/model/post';
import { AlertType } from '../../enum/alert-type.enum';
import { PasswordChange } from '../../model/password-change';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit, OnDestroy {
  private Subscriptions: Subscription[] = [];
  user: User;
  postId: number;
  posts: Post = new Post();
  host: string;
  userHost: string;
  postHost: string;
  username: string;
  profilePictureChange: boolean;
  profilePicture: File;

  constructor(private router: Router,
              private alertService: AlertService,
              public accountService: AccountService,
              private postService: PostService,
              private loadingService: LoadingService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.loadingService.loading.next(true);
    this.username = this.route.snapshot.paramMap.get('username');
    this.host = this.postService.host;
    this.userHost = this.postService.userHost;
    this.postHost = this.postService.postHost;
    this.getUserInfo(this.username);
    this.loadingService.loading.next(false);
  }

  getUserInfo(username: string): void {
    this.Subscriptions.push(
      this.accountService.getUserInformation(username).subscribe((response: User) => {
        this.user = response;
        this.getPostsByUsername(this.user.username);
      }, error => {
        console.log(error);
        this.user = null;
      })
    );
  }
  getPostsByUsername(username: string) {
    this.Subscriptions.push(
      this.postService.getPostsByUsername(username).subscribe((response: Post[]) => {

      })
    );
  }

  onProfilePictureSelected(event: any): void {
    console.log(event);
    this.profilePicture = event.target.files[0] as File;
    console.log(this.profilePicture);
    this.profilePictureChange = true;
  }

  onUpdateUser(updatedUser: User): void {
    this.loadingService.loading.next(true);
    this.Subscriptions.push(
      this.accountService.updateUser(updatedUser).subscribe(response => {
        console.log(response);
        if (this.profilePictureChange) {
          this.accountService.uploadUserProfilePicture(this.profilePicture);
        }
        this.loadingService.loading.next(false);
        this.alertService.showAlert('Perfil correctamente actualizado', AlertType.SUCCESS);
      }, error => {
        console.log(error);
        this.loadingService.loading.next(false);
        this.alertService.showAlert('fallo al intentar actualizar el perfil, intenta mas tarde', AlertType.DANGER);
      })
    );
  }

  onChangePassword(passwordChange: PasswordChange) {
    console.log(passwordChange);
    const element: HTMLElement = document.getElementById(
      'changePasswordDismiss'
    ) as HTMLElement;
    element.click();
    this.loadingService.loading.next(true);
    this.Subscriptions.push(
      this.accountService.changePassowrd(passwordChange).subscribe(
        response => {
          console.log(response);
          this.loadingService.loading.next(false);
          this.alertService.showAlert(
            'Password was updated successfully',
            AlertType.SUCCESS
          );
        },
        error => {
          console.log(error);
          this.loadingService.loading.next(false);
          const errorMsg: string = error.error;
          this.showErrorMessage(errorMsg);
        }
      )
    );
  }

  private showErrorMessage(errorMessage: string): void {
    if (errorMessage === 'PasswordNotMatched') {
      this.alertService.showAlert(
        'Los password no son iguales',
        AlertType.DANGER
      );
    } else if (errorMessage === 'IncorrectCurrentPassword') {
      this.alertService.showAlert(
        'El passowrd actual no es correcto',
        AlertType.DANGER
      );
    } else {
      this.alertService.showAlert(
        'Ha ocurrido un error intentalo mas tarde',
        AlertType.DANGER
      );
    }
  }
  ngOnDestroy(): void {
    this.Subscriptions.forEach(sub => sub.unsubscribe());
  }

  seeOnePost(postId): void {
    this.router.navigate(['/post', postId]);
    console.log(postId);
  }

}
