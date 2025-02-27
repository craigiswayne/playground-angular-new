import { TestBed } from '@angular/core/testing';

import { MyThreeJsService } from './my-three-js.service';

describe('ThreeJsSceneService', () => {
  let service: MyThreeJsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyThreeJsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
