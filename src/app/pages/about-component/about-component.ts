import { Component, inject } from '@angular/core';
import { SettingService } from '../../shared/services/setting-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about-component',
  imports: [CommonModule],
  templateUrl: './about-component.html',
  styleUrl: './about-component.css',
})
export class AboutComponent {
  settingsService = inject(SettingService);

  async ngOnInit() {
    await this.settingsService.loadSettings();
  }

  services = [
    {
      icon: '✏️',
      title: 'Stationery',
      description:
        'Pens, notebooks, school supplies, and office essentials — everything you need for writing, studying, and office work.',
      color: 'amber',
    },
    {
      icon: '🛒',
      title: 'Grocery',
      description:
        'Cold drinks, juices, eggs, detergents, and daily-use items — everything you need for your home in one place.',
      color: 'green',
    },
    {
      icon: '🚬',
      title: 'Tobacco',
      description:
        'Cigarettes and nicotine products for adult customers only — available responsibly as per legal age requirements.',
      color: 'rose',
    },
    {
      icon: '🏠',
      title: 'Daily Essentials',
      description:
        'Everyday useful items for quick and convenient shopping — from small household needs to basic personal use products, all in one place.',
      color: 'blue',
    },
  ];

  stats = [
    { value: '10+', label: 'Years Experience', icon: '🏅' },
    { value: '5,000+', label: 'Happy Customers', icon: '🤝' },
    { value: '500+', label: 'Products', icon: '📦' },
    { value: '7 Days', label: 'Always Open', icon: '🕐' },
  ];

  team = [
    {
      name: 'Waqas Tariq',
      role: 'Managing Director',
      description:
        'Waqas Tariq , MD of Hannan Stationers oversees the entire business, makes key decisions, and ensures smooth growth and profitability of the store.',
      initials: 'WT',
      color: 'amber',
    },
    {
      name: 'Muhammad Salman',
      role: 'Digital Operations Officer',
      description:
        'MS manages all computer-related tasks at Hannan Stationers, including website handling, digital records, and supporting online and technical operations.',
      initials: 'MS',
      color: 'emerald',
    },
    {
      name: 'Muhammad Hannan',
      role: 'Accounts & Audit Incharge',
      description:
        'Hannan is responsible for maintaining financial records, managing check and balance of transactions, and ensuring accurate reporting of all store finances.',
      initials: 'MH',
      color: 'sky',
    },
  ];
}
