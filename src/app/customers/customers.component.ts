import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CustomerService } from '../shared/services/customer.service';
import { Customer, CustomerDetails } from '../core/models';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit, OnDestroy {
  listOfCustomer: Customer[] = [];
  customerdetails: CustomerDetails | null = null;
  displayedColumns: string[] = ['client_id', 'nom', 'prenom', 'adresse', 'email', 'type', 'actions'];
  private destroy$ = new Subject<void>();

  constructor(private customerService: CustomerService) {}

  ngOnInit(): void {
    this.customerService.getCustomers()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.listOfCustomer = data;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  detail(id: string): void {
    this.customerService.getCustomerDetails(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.customerdetails = data;
      });
  }
}