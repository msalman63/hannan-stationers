import { Component } from '@angular/core';
import { Footer } from "./footer/footer";
import { Header } from './header/header';
import { RouterOutlet } from '@angular/router';
import { SideBar } from '../../shared/components/side-bar/side-bar';

@Component({
  selector: 'app-main-layout',
  imports: [Header , RouterOutlet , SideBar , Footer],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {

}
