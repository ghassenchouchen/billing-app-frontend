import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule }   from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// App Routing
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// Components
import { CustomersComponent } from './customers/customers.component';
import { ServicesComponent } from './services/services.component';
import { AbonnementsComponent } from './abonnements/abonnements.component';
import { OffersComponent } from './offers/offers.component';
import { BillsComponent } from './bills/bills.component';
import { LoginComponent } from './login/login.component';
import { ConfirmModalComponent } from './shared/components/confirm-modal/confirm-modal.component';

// Core Services
import { ApiService } from './core/services/api.service';
import { AuthService } from './core/services/auth.service';

// Core Interceptors
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    CustomersComponent,
    ServicesComponent,
    AbonnementsComponent,
    OffersComponent,
    BillsComponent,
    LoginComponent,
    ConfirmModalComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule
  ],
  providers: [
    ApiService,
    AuthService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true
    }
  ],                   
  bootstrap: [AppComponent]
})
export class AppModule { }
