import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { Alert } from './model/alert';
import { LoadingService } from './services/loading.service';
import { AlertService } from './services/alert.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];
  public alerts: Alert[] = [];
  public loading: boolean;

  constructor(private loadingService: LoadingService, private alertService: AlertService) {}

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  ngOnInit() {
    this.subscriptions.push(
      this.loadingService.loading.subscribe(isLoading => {
        this.loading = isLoading;
      })
    );

    this.subscriptions.push(
      this.alertService.alerts.subscribe(alert => {
        this.alerts.push(alert);
        this.closeAlert(3);
      })
    );
  }

  closeAlert(seconds: number): void {
    setTimeout(() => {
      // tslint:disable-next-line:prefer-const
      let element: HTMLElement = document.getElementById('dismissAlert') as HTMLElement;
      element.click();
    }, seconds * 1000);
  }
}
