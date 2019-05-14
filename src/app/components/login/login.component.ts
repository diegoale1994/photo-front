import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountService } from 'src/app/services/account.service';
import { LoadingService } from 'src/app/services/loading.service';
import { AlertService } from '../../services/alert.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { User } from 'src/app/model/user';
import { AlertType } from '../../enum/alert-type.enum';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  constructor(private accountService: AccountService,
              private loadingService: LoadingService,
              private alertService: AlertService,
              private router: Router) { }

  ngOnInit() {
    if (this.accountService.isLoggedIn()) {
      if (this.accountService.redirectURL) {
        this.router.navigateByUrl(this.accountService.redirectURL);
      } else {
      this.router.navigateByUrl('/home');
    }
  } else {
    this.router.navigateByUrl('/login');
  }
}

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onLogin(user: User) {
    this.loadingService.loading.next(true);
    this.subscriptions.push(
      this.accountService.login(user).subscribe(response => {
        const token: string = response.headers.get('Authorization');
        this.accountService.saveToken(token);
        if (this.accountService.redirectURL) {
          this.router.navigateByUrl(this.accountService.redirectURL);
        } else {
          this.router.navigateByUrl('/home');
        }
        this.loadingService.loading.next(false);
      }, error => {
        console.log(error);
        this.loadingService.loading.next(false);
        this.alertService.showAlert('Usuario o contraseña Incorrecta', AlertType.DANGER);
      })
    );
  }

}
