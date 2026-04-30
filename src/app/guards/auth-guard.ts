import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../shared/services/supabase-service';

export const authGuard: CanActivateFn = async (route, state) => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  try {
    const session = await supabaseService.getSession();
    if (session) return true;
  } catch (error) {
    console.log(error);
  }
  router.navigate(['/login']);
  return false;
};
