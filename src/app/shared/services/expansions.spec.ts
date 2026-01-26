import { TestBed } from '@angular/core/testing';

import { Expansions } from './expansions';

describe('Expansions', () => {
  let service: Expansions;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Expansions);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
