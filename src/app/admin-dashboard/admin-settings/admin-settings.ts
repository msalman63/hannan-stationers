import { Component, inject, OnInit } from '@angular/core';
import { SupabaseService } from '../../shared/services/supabase-service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Settings } from '../../interfaces/settings';
import { ToastrService } from 'ngx-toastr';
import { SettingService } from '../../shared/services/setting-service';
import { Spinner } from '../../shared/components/spinner/spinner';

@Component({
  selector: 'app-admin-settings',
  imports: [CommonModule, ReactiveFormsModule , Spinner],
  templateUrl: './admin-settings.html',
  styleUrl: './admin-settings.css',
})
export class AdminSettings implements OnInit {
  isLoading = false;
  isFetching = true;
  isPageLoading : boolean = true;

  private settingsService = inject(SettingService);
  private toastr = inject(ToastrService);

  settingForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.settingForm = this.fb.group({
      whatsapp: ['', [Validators.pattern(/^https:\/\/wa\.me\/\d{10,15}$/)]],
      tiktok: ['', [Validators.pattern(/^https:\/\/(www\.)?tiktok\.com\/@[\w.]{1,24}$/)]],
      facebook: ['', [Validators.pattern(/^https:\/\/(www\.)?facebook\.com\/.+$/)]],
      instagram: ['', [Validators.pattern(/^https:\/\/(www\.)?instagram\.com\/@?[\w.]+\/?$/)]],
      location: ['', [Validators.required, Validators.minLength(5)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[0-9\s\-]{10,15}$/)]],
    });
  }

  async ngOnInit() {
    this.settingForm.disable();

    await this.settingsService.loadSettings();
    this.isPageLoading = false;
    const data = this.settingsService.settings(); //read from signal

    if (data) {
      this.settingForm.patchValue(data);
    } else {
      this.toastr.error('Failed to load settings.');
    }

    this.isFetching = false;
    this.settingForm.enable();
  }

  async onSubmit() {
    if (this.settingForm.invalid) return;

    this.isLoading = true;

    try {
      const { error } = await this.settingsService.updateSettings(
        this.settingForm.value as Partial<Settings>,
      );

      if (error) {
        this.toastr.error('Failed to update settings. Please try again.');
        console.error('Update error:', error);
      } else {
        this.toastr.success('Settings updated successfully!');
      }
    } finally {
      this.isLoading = false;
    }
  }
}
