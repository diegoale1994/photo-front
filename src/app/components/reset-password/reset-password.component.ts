import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertService } from 'src/app/services/alert.service';
import { AccountService } from 'src/app/services/account.service';
import { Router } from '@angular/router';
import { LoadingService } from 'src/app/services/loading.service';
import { Subscription } from 'rxjs';
import { AlertType } from '../../enum/alert-type.enum';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  constructor(private alertService: AlertService, private accountService: AccountService, private router: Router,
              private loadingService: LoadingService) { }

  ngOnInit() {
    if (this.accountService.isLoggedIn()) {
      if (this.accountService.redirectURL) {
        this.router.navigateByUrl(this.accountService.redirectURL);
      } else {
      this.router.navigateByUrl('/home');
    }
  } else {
    this.router.navigateByUrl('/resetpassword');
  }
  }

  onResetpassword(form) {
    this.loadingService.loading.next(true);
    console.log(form.email);
    const email = form.email;
    this.subscriptions.push(
      this.accountService.resetPassword(email).subscribe(response => {
        console.log(response);
        this.loadingService.loading.next(false);
        this.alertService.showAlert('Un nuevo password fue enviado al correo electronico', AlertType.SUCCESS);
      }, (error: HttpErrorResponse) => {
          console.log(error);
          const errorMsg = error.error;
          if (errorMsg === 'emailNotFound') {
            this.alertService.showAlert('No existe una cuenta para ese correo', AlertType.DANGER);
          }
          if (errorMsg !== 'emailNotFound') {
            this.alertService.showAlert('A ocurrido un error intentalo mas tarde', AlertType.DANGER);
          }
          this.loadingService.loading.next(false);
      })
    );
  }

  ngOnDestroy(): void {
   this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
