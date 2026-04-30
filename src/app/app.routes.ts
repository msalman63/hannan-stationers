import { Routes } from '@angular/router';
import { MainLayout } from './layouts/main-layout/main-layout';
import { Login } from './auth/login/login';
import { AdminDashboard } from './admin-dashboard/admin-dashboard';
import { authGuard } from './guards/auth-guard';
import { AdminGrocery } from './admin-dashboard/admin-grocery/admin-grocery';
import { AdminSports } from './admin-dashboard/admin-sports/admin-sports';
import { AdminTobacco } from './admin-dashboard/admin-tobacco/admin-tobacco';
import { AdminDeals } from './admin-dashboard/admin-deals/admin-deals';
import { AdminSettings } from './admin-dashboard/admin-settings/admin-settings';
import { AdminStationery } from './admin-dashboard/admin-stationery/admin-stationery';
import { TobaccoComponent } from './pages/tobacco-component/tobacco-component';
import { GroceryComponent } from './pages/grocery-component/grocery-component';
import { StationeryComponent } from './pages/stationery-component/stationery-component';
import { AboutComponent } from './pages/about-component/about-component';
import { HomeComponent } from './pages/home-component/home-component';
import { SportsComponent } from './pages/sports-component/sports-component';
import { SideBar } from './shared/components/side-bar/side-bar';
import { Checkout } from './shared/components/checkout/checkout';
import { AdminOrders } from './admin-dashboard/admin-orders/admin-orders';
import { DealsComponent } from './pages/deals-component/deals-component';
import { ProductDetails } from './shared/components/product-details/product-details';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'cart', component: SideBar },
  { path: 'checkout', component: Checkout },
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: HomeComponent, pathMatch: 'full' },
      { path: 'stationers', component: StationeryComponent },
      { path: 'grocery', component: GroceryComponent },
      { path: 'tobacco', component: TobaccoComponent },
      { path: 'about', component: AboutComponent },
      { path: 'sports', component: SportsComponent },
      { path: 'deals', component: DealsComponent },
      { path: 'product/:category/:id', component:  ProductDetails},
      {
        path: 'admin',
        component: AdminDashboard,
        canActivate: [authGuard],
        children: [
          { path: '', redirectTo: 'stationery', pathMatch: 'full' },
          { path: 'stationery', component: AdminStationery },
          { path: 'grocery', component: AdminGrocery },
          { path: 'sports', component: AdminSports },
          { path: 'tobacco', component: AdminTobacco },
          { path: 'deals', component: AdminDeals },
          { path: 'orders', component: AdminOrders },
          { path: 'settings', component: AdminSettings },
        ],
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
