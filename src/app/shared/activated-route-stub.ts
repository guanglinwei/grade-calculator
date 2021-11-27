// https://angular.io/guide/testing-components-scenarios#routed-components

import { ActivatedRoute, ActivatedRouteSnapshot, convertToParamMap, ParamMap, Params } from '@angular/router';
import { ReplaySubject } from 'rxjs';

/**
 * An ActivateRoute test double with a `paramMap` observable.
 * Use the `setParamMap()` method to add the next `paramMap` value.
 */
export class ActivatedRouteStub implements Partial<ActivatedRoute> {
  // Use a ReplaySubject to share previous values with subscribers
  // and pump new values into the `paramMap` observable
  private subject = new ReplaySubject<ParamMap>();
  private _paramMap!: ParamMap;

  constructor(initialParams?: Params) {
    this.setParamMap(initialParams);
  }

  get snapshot(): ActivatedRouteSnapshot {
      const snapshot: Partial<ActivatedRouteSnapshot> = {paramMap: this._paramMap};
      return snapshot as ActivatedRouteSnapshot;
  }

  /** The mock paramMap observable */
  readonly paramMap = this.subject.asObservable();

  /** Set the paramMap observable's next value */
  setParamMap(params: Params = {}) {
    this._paramMap = convertToParamMap(params);
    this.subject.next(this._paramMap);
  }
}