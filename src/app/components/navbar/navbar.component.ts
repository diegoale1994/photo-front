import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '../../services/alert.service';
import { AccountService } from 'src/app/services/account.service';
import { PostService } from '../../services/post.service';
import { LoadingService } from 'src/app/services/loading.service';
import { Subscription } from 'rxjs';
import { User } from 'src/app/model/user';
import { Post } from 'src/app/model/post';
import { HttpEventType } from '@angular/common/http';
import { AlertType } from '../../enum/alert-type.enum';


@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private Subscriptions: Subscription[] = [];
  user: User;
  searchedUser: User[];
  host: string;
  userHost: string;
  postHost: string;
  postPicture: File;
  userName: string;
  userLoggedIn: boolean;
  showNavbar: boolean;
  showSuccessAlert: boolean;
  photoName: string;
  latitude: any;
  logitude: any;
  location = null;
  progress: number;
  newPostUrl: string;
  clientHost: string;
  postFail: boolean;

  constructor(private router: Router,
              private alertService: AlertService,
              private accountService: AccountService,
              private postService: PostService,
              private loadingService: LoadingService) { }

  ngOnInit() {
    this.loadingService.loading.next(true);
    this.host = this.postService.host;
    this.clientHost = this.postService.clienteHost;
    this.userHost = this.postService.userHost;
    this.postHost = this.postService.postHost;
    this.showNavbar = true;
  }

  getUserInfo(username: string): void {
    this.Subscriptions.push(
      this.accountService.getUserInformation(username).subscribe((response: User) => {
        this.user = response;
        this.userLoggedIn = true;
        this.showNavbar = true;
      },
      error => {
        console.log(error);
        this.userLoggedIn = false;
      })
    );
  }

  onSearchUsers(event: any) {
    console.log(event);
    const username = event;
    this.Subscriptions.push(
      this.accountService.searchUsers(username).subscribe((response: User[]) => {
        console.log(response);
        this.searchedUser = response;
      }, error => {
        console.log(error);
        return this.searchedUser = [];
      })
    );
  }

  getUserProfile(username: string): void {
    this.router.navigate(['/profile', username]);
  }

  getSearchUserProfile(username: string): void {
    const element: HTMLElement = document.getElementById(
      'closeSearchModal'
    ) as HTMLElement;
    element.click();
    this.router.navigate(['/profile', username]);
    setTimeout(() => {
      location.reload();
    }, 100);
  }

  onFileSelected(event: any): void {
    console.log('imagen seleccionada');
    this.postPicture = event.target.files[0];
    this.photoName = this.postPicture.name;
  }

  ngOnDestroy(): void {
    this.Subscriptions.forEach(sub => sub.unsubscribe);
  }

  OnNewPost(post: Post): void {
    const element: HTMLElement = document.getElementById(
      'dismissOnSubmitPost'
    ) as HTMLElement;
    element.click();
    this.loadingService.loading.next(true);
    this.Subscriptions.push(
      this.postService.save(post).subscribe((response: Post) => {
        console.log(response);
        let postId: number = response.id;
        this.savePicture(this.postPicture);
        this.loadingService.loading.next(false);
        this.newPostUrl = `${this.clientHost}/post/${postId}`;
      }, error => {
        console.log(error);
        this.postFail = true;
        this.loadingService.loading.next(false);
      })
    );
  }
  savePicture(picture: File): void {
   this.Subscriptions.push(
     this.postService.uploadPostPicture(picture).subscribe(response => {
       if (response.type === HttpEventType.UploadProgress) {
        this.progress = (response.loaded / response.total) * 100;
       } else {
         console.log(response);
         this.OnNewPostSuccess(8);
       }
     }, error => {
       console.log(error);
     })
   );
  }
  OnNewPostSuccess(second: number) {
    this.showSuccessAlert = true;
    setTimeout(() => {
      this.showSuccessAlert = false;
      this.newPostUrl = null;
    }, second * 1000);
  }

  logOut() {
    this.loadingService.loading.next(true);
    this.accountService.logOut();
    this.router.navigate(['/login']);
    this.loadingService.loading.next(false);
    this.alertService.showAlert('Acabas de cerrar session', AlertType.SUCCESS);
  }

  getLonAndLat(): void {
    if (window.navigator && window.navigator.geolocation) {
      window.navigator.geolocation.getCurrentPosition(
        position => {
          this.latitude = position.coords.latitude;
          this.logitude = position.coords.longitude;
          this.getUserLocation(this.latitude, this.logitude);
        },
        error => {
          switch (error.code) {
            case 1:
              console.log('Permission Location Denied.');
              break;
            case 2:
              console.log('Position Unavailable.');
              break;
            case 3:
              console.log('Timeout.');
              break;
          }
        }
      );
    }
  }

  getUserLocation(latitude, longitude): void {
    this.Subscriptions.push(
      this.accountService.getLocation(latitude, longitude).subscribe(
        (response: any) => {
          this.location = response.results[3].formatted_address;
        },
        error => {
          console.log(error);
        }
      )
    );
  }
}
