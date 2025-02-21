import { TestBed } from '@angular/core/testing';

import { AddAuthTokenInterceptor } from './add-auth-token.interceptor';

describe('AddAuthTokenInterceptor', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      AddAuthTokenInterceptor
      ]
  }));

  it('should be created', () => {
    const interceptor: AddAuthTokenInterceptor = TestBed.inject(AddAuthTokenInterceptor);
    expect(interceptor).toBeTruthy();
  });
});
