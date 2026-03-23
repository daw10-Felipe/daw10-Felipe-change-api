import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { map, take, switchMap, of } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  
  if (!auth.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  
  const currentUser = auth.getCurrentUser();
  if (currentUser) {
    if (currentUser.rol_id === 1) {
      return true;
    }
    router.navigate(['/']);
    return false;
  }

  
  return auth.getProfile().pipe(
    take(1),
    map(user => {
      if (user && user.rol_id === 1) {
        return true;
      }
      router.navigate(['/']);
      return false;
    })
  );
};
