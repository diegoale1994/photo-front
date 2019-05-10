import { Injectable } from '@angular/core';
import { Server } from '../constants/server';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../model/user';
import { Post } from '../model/post';

@Injectable({
  providedIn: 'root'
})

export class AccountService {
  constant: Server = new Server();
  public host: string = this.constant.host;
  public token: string;
  public logginUsername: string | null;
  public redirectURL: string;
  private googleMapsAPIkEY = 'AIzaSyD9MC5YRuZpISFdyOFK0BE34c5oFTmrMcY';
  private googleMapsAPIUrl = 'https://maps.googleapis.com/maps/api/geocode/json?latlng=';
  private jwtHelper = new JwtHelperService();
  constructor(private http: HttpClient) { }

  login(user: User): Observable<HttpErrorResponse | HttpResponse<any>> {
    return this.http.post<HttpErrorResponse | HttpResponse<any>>(`${this.host}/user/login`, user, {observe: 'response'});
  }

  register(user: User): Observable<User | HttpResponse<any>> {
    return this.http.post<User>(`${this.host}/user/register`, user);
  }

  resetPassword(email: string) {
   return this.http.get(`${this.host}/user/resetPassword/${email}`, {responseType: 'text'});
  }

  logOut(): void {
    this.token = null;
    localStorage.removeItem('token');
  }

  saveToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
  }

  loadToken(): void {
    this.token = localStorage.getItem('token');
  }

  getToken(): string {
    return this.token;
  }

  isLoggedIn(): boolean {
    this.loadToken();
    if (this.token != null && this.token !== '') {
      if (this.jwtHelper.decodeToken(this.token).sub != null || '') {
        if (!this.jwtHelper.isTokenExpired(this.token)) {
          this.logginUsername = this.jwtHelper.decodeToken(this.token).sub;
          return true;
        }
      }
    } else {
      this.logOut();
      return false;
    }
  }

  getUserInformation(username: string): Observable<User> {
    return this.http.get<User>(`${this.host}/user/${username}`);
  }

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.host}/post/list`);
  }

  searchUsers(username: string): Observable<User[]> {
    return this.http.get<User[]>(`${this.host}/user/findByUsername/${username}`);
  }

  getLocation(latitude: string, logitude: string): Observable<any> {
    return this.http.get<any>(`${this.googleMapsAPIUrl}${latitude},${logitude}&key=${this.googleMapsAPIkEY}`);
  }

  updateUser(updateUser: User): Observable<User> {
    return this.http.put<User>(`${this.host}/user/update`, updateUser);
  }

  changePassowrd(changePassword: string) {
    return this.http.post(`${this.host}/user/changePassword`, changePassword, {responseType: 'text'});
  }

  uploadUserProfilePicture(profilePicture: File) {
    const fd = new FormData();
    fd.append('image', profilePicture);
    return this.http.post(`${this.host}/user/photo/upload`, fd, {responseType: 'text'})
    .subscribe((response: any) => {
      console.log(response);
      console.log('User profile picture was uploaded' + response);
    },
    e => {
      console.log(e);
    });
  }
}
