import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomersComponent } from './customers/customers.component';
import { ServicesComponent } from './services/services.component';
import { AbonnementsComponent } from './abonnements/abonnements.component';
import { OffersComponent } from './offers/offers.component';
import { BillsComponent } from './bills/bills.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './core/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'Login', pathMatch: 'full' },
  { path: 'Customers', component: CustomersComponent, canActivate: [AuthGuard] },
  { path: 'Abonnements', component: AbonnementsComponent, canActivate: [AuthGuard] },
  { path: 'Services', component: ServicesComponent, canActivate: [AuthGuard] },
  { path: 'Offers', component: OffersComponent, canActivate: [AuthGuard] },
  { path: 'Bills', component: BillsComponent, canActivate: [AuthGuard] },
  { path: 'Login', component: LoginComponent },
  { path: '**', redirectTo: 'Login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
