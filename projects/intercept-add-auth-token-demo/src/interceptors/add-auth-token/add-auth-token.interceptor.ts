import {HttpRequest, HttpHandler, HttpEvent, HttpInterceptor} from '@angular/common/http';
import {AuthService} from '../../services/auth/auth.service';
import {inject} from '@angular/core';
import {Observable} from 'rxjs';

export class AddAuthTokenInterceptor implements HttpInterceptor {
  private authService = inject(AuthService)

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

    /**
     * Don't add the token if the user is not logged in
     */
    if (!this.authService.isLoggedIn) {
      return next.handle(request);
    }

    const authReq = request.clone({
      headers: request.headers.set('Authorization', `Bearer ${this.authService.token}`)
    });

    return next.handle(authReq);
  }
}
