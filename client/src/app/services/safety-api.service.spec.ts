import { TestBed } from '@angular/core/testing';

import { SafetyApiService } from './safety-api.service';

describe('SafetyApiService', () => {
  let service: SafetyApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SafetyApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
