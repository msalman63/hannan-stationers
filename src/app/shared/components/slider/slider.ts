import { CommonModule } from '@angular/common';
import { Component, signal, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-slider',
  imports: [CommonModule],
  templateUrl: './slider.html',
  styleUrl: './slider.css',
})
export class Slider implements OnInit, OnDestroy {
  images = [
    'images/HT-Banner1.jpeg',
    'images/HT-Banner2.jpeg',
    'images/HT-Banner3.jpeg',
    'images/HT-Banner4.jpeg',
    'images/HT-Banner5.jpeg',
  ];
  currentIndex = signal(0);

  //store interval reference so we can clear it on destroy
  private autoSlideInterval: ReturnType<typeof setInterval> | null = null;

  ngOnInit() {
    this.startAutoSlide();
  }

  ngOnDestroy() {
    this.stopAutoSlide();
  }

  private startAutoSlide() {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, 3000);
  }

  private stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  nextSlide() {
    if (this.currentIndex() < this.images.length - 1) {
      this.currentIndex.update((val) => val + 1);
    } else {
      this.currentIndex.set(0);
    }
  }

  prevSlide() {
    if (this.currentIndex() > 0) {
      this.currentIndex.update((val) => val - 1);
    } else {
      // FIXED: was setting to 0 instead of jumping to last image
      this.currentIndex.set(this.images.length - 1);
    }
  }
}
