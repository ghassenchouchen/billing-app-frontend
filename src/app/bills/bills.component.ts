import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Bill, BillDetails, CustomerDetails } from '../core/models';
import { BillService } from '../shared/services/bill.service';
import { CustomerService } from '../shared/services/customer.service';

@Component({
  selector: 'app-bills',
  templateUrl: './bills.component.html',
  styleUrls: ['./bills.component.css']
})
export class BillsComponent implements OnInit, OnDestroy {
  notpaid: boolean = false;
  notcalculated: boolean = false;
  listofbills: Bill[] = [];
  billdetails: BillDetails | null = null;
  post_sum: any;
  post_paid: any;
  customer_detail: CustomerDetails | null = null;
  private destroy$ = new Subject<void>();

  constructor(private billService: BillService, private customerService: CustomerService) {}

  ngOnInit(): void {
    this.billService.getBills()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.listofbills = data;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  detail(id: string, client_id: string): void {
    this.billService.getBillDetails(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.billdetails = data;
        this.notpaid = !data.paid;
        this.notcalculated = data.somme_tot === 0;

        this.customerService.getCustomerDetails(client_id)
          .pipe(takeUntil(this.destroy$))
          .subscribe((customerData) => {
            this.customer_detail = customerData;
          });
      });
  }

  pay(id: string): void {
    this.billService.payBill(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.post_paid = data;
      });
  }

  Calculate(id: string): void {
    this.billService.calculateBill(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.post_sum = data;
      });
  }
}
