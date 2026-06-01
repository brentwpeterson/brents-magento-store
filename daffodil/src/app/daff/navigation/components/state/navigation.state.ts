import {
  Injectable,
  inject,
} from '@angular/core';
import {
  Observable,
  Subject,
} from 'rxjs';
import {
  map,
  startWith,
  catchError,
  switchMap,
} from 'rxjs/operators';
import { DaffNavigationTree } from '@daffodil/navigation';
import {
  DaffNavigationDriver,
  DaffNavigationServiceInterface,
} from '@daffodil/navigation/driver';

export interface NavigationState {
  data: DaffNavigationTree | null;
  error: any;
  loading: boolean;
}

@Injectable()
export class NavigationStateService {
  private navigationDriver: DaffNavigationServiceInterface<DaffNavigationTree> = inject(DaffNavigationDriver);
  private retryTrigger$ = new Subject<void>();
  
  
  readonly state$: Observable<NavigationState> = this.createStateObservable();

  
  private createStateObservable(): Observable<NavigationState> {
    return this.retryTrigger$.pipe(
      startWith(undefined),
      switchMap(() =>
        this.navigationDriver.getTree().pipe(
          map((navigationTree) => ({ data: navigationTree, error: null, loading: false })),
          catchError((error) => [{ data: null, error, loading: false }]),
          startWith({ data: null, error: null, loading: true }),
        ),
      ),
    );
  }
  

  retry(): void {
    this.retryTrigger$.next();
  }
}
