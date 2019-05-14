import { Component, OnInit, OnDestroy } from '@angular/core';
import { AccountService } from 'src/app/services/account.service';
import { LoadingService } from 'src/app/services/loading.service';
import { AlertService } from '../../services/alert.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { User } from 'src/app/model/user';
import { AlertType } from '../../enum/alert-type.enum';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit, OnDestroy {
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
    this.router.navigateByUrl('/signup');
  }
  }

  onRegister(user: User): void {
    this.loadingService.loading.next(true);
    console.log(user);
    this.subscriptions.push(
      this.accountService.register(user).subscribe(response => {
        console.log(response);
        this.loadingService.loading.next(false);
        this.alertService.showAlert('Usuario registrado con exito, revisa la bandeja de entrada de tu corre', AlertType.SUCCESS);
      }, (error: HttpErrorResponse) => {
          console.log(error);
          this.loadingService.loading.next(false);
          const errorMsg: string = error.error;
          if (errorMsg === 'usernameExist') {
            this.alertService.showAlert('usuario ya esta en uso, por favor ingresa otro', AlertType.DANGER);
          } else if (errorMsg === 'emailExist') {
            this.alertService.showAlert('Correo electronico ya en uso', AlertType.DANGER);
          } else {
            this.alertService.showAlert('Ha ocurrido un error intentalo mas tarde', AlertType.DANGER);
          }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
