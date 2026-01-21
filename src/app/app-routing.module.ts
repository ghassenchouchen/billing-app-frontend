import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CustomersComponent } from './customers/customers.component';
import { ServicesComponent } from './services/services.component';
import { ContractsComponent } from './contracts/contracts.component';
import { OffersComponent } from './offers/offers.component';
import { BillsComponent } from './bills/bills.component';
import { LoginComponent } from './login/login.component';
import { CustomerPortalComponent } from './customer-portal/customer-portal.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminGuard } from './core/guards/admin.guard';
import { CustomerGuard } from './core/guards/customer.guard';

const routes: Routes = [
  { path: '', redirectTo: 'Login', pathMatch: 'full' },
  { path: 'Customers', component: CustomersComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'Contracts', component: ContractsComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'Services', component: ServicesComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'Offers', component: OffersComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'Bills', component: BillsComponent, canActivate: [AuthGuard, AdminGuard] },
  { path: 'Portal', component: CustomerPortalComponent, canActivate: [AuthGuard, CustomerGuard] },
  { path: 'Login', component: LoginComponent },
  { path: '**', redirectTo: 'Login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
