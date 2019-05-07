import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AlertType } from '../enum/alert-type.enum';
import { Alert } from '../model/alert';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
  public alerts: Subject<Alert> = new Subject();

  constructor() { }

  showAlert(message: string, alertType: AlertType): void {
    const alert = new Alert(message, alertType);
    this.alerts.next(alert);
  }
}
