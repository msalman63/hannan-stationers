import { Component, inject } from '@angular/core';
import { RouterLink } from "@angular/router";
import { CommonModule } from '@angular/common';
import { SettingService } from '../../../shared/services/setting-service';

@Component({
  selector: 'app-footer',
  imports: [RouterLink , CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
   settingsService = inject(SettingService);

  async ngOnInit() {
    await this.settingsService.loadSettings();
  }
}
