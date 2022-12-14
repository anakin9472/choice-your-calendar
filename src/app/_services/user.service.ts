import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AccountRegister, AccountVerify, UserLoginResponse, UserProfile } from '../_models/user';
import { AuthService } from './auth.service';
import { LocalStorageService } from './local-storage.service';
import Utils from '../_utils/utils';

const requestHeader = new HttpHeaders(
  {'No-Auth': 'True'},
)

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(
    private http: HttpClient, 
    private storageService: LocalStorageService) 
  {}

  isUserLogin: boolean = false;
  loggedInFlag: Subject<boolean> = new Subject();
  user: UserProfile = {
    id: 6,
    fullname: '',
    email: '',
    address: '',
    description: '',
    active: true,
    imagePath: '',
    effectiveDate: '',
    expiredDate: '',
    pathMapping: '',
    autoApprovalEventFlag: true
  };

  login(model: any): Observable<any>
  {
    return this.http.post(Utils.AUTH_API + '/basic-login',model, 
    {headers: requestHeader}).pipe(
      map((response: any) =>
        {          
          //This data will include accessToken & refreshToken
          if (response.statusCode === 200 && response.data != null)
          {
            this.storageService.setAccessToken(response.data.accessToken);
            this.storageService.setRefreshToken(response.data.refreshToken);
          }
          else 
          {
            
          }
          return response;
        })
    )
  }

  register(requestBody: AccountRegister) 
  {
    return this.http.post(Utils.AUTH_API + '/register-account', requestBody,
    {headers: requestHeader}).pipe(
      map((response: any)=>
      {
        return response
      }),
      catchError(
        err => 
        {
          return err  
        })  
    )
  }

  logout()
  {
    this.storageService.clearStorage();
  }

  roleMatch(allowedRole: string) : boolean
  {
    let isMatch = false;
    const userRole: any = this.storageService.getRole();

    if (userRole != null) 
    {
      if (userRole === allowedRole)
        isMatch = true;
    }
    return isMatch;
  }

  getRole() : Observable<any>
  {
    return this.http.get(Utils.AUTH_API + '/get-roles').pipe(
      map((response:any) => {
          localStorage.setItem('role',response.data[0].code)
        return response
      })
    )
  }

  getUserProfile() : Observable<any>
  {
    return this.http.get(Utils.ACCOUNT_API + '/profile').pipe(
      map((response: any) => 
      {
        if (response.statusCode === 200)
        {
          this.user = response.data;
        }
        return this.user;
      }),
      catchError(
        err =>
        {
          return err
        }
      )
    )
  }

  verifyAccount(requestBody: AccountVerify)
  {
    return this.http.post(Utils.AUTH_API + '/verify-account',requestBody).pipe(
      map((response: any) =>
      {
        return response;
      }
      ),
      catchError(
        err =>
        {
          return err
        }
      )
    )
  }

}
