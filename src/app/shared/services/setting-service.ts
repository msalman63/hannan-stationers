import { inject, Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase-service';
import { Settings } from '../../interfaces/settings';

@Injectable({
  providedIn: 'root',
})
export class SettingService {
  private supabaseService = inject(SupabaseService);
  settings = signal<Settings | null>(null);

  async loadSettings() {
    if (this.settings()) return;
    const { data, error } = await this.supabaseService.getSettings();
    if (data && !error) this.settings.set(data);
  }

  async updateSettings(update: Partial<Settings>) {
    const currentId = this.settings()?.id;
    if (!currentId) return { error: new Error('Settings ID missing') };

    const { error } = await this.supabaseService.updateSettings(update, currentId);
    if (!error) this.settings.set({ ...this.settings()!, ...update });
    return { error };
  }
}
