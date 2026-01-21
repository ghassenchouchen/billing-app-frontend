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
        this.patchBill(data);
      });
  }

  Calculate(id: string): void {
    this.billService.calculateBill(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.post_sum = data;
        this.patchBill(data);
      });
  }

  exportBills(): void {
    if (!this.listofbills.length) {
      return;
    }

    const headers = ['facture_id', 'client_id', 'consom_appel', 'consom_sms', 'consom_internet', 'paid', 'somme_tot'];
    const rows = this.listofbills.map(bill => [
      bill.facture_id,
      bill.client_id,
      bill.consom_appel,
      bill.consom_sms,
      bill.consom_internet,
      bill.paid ? 'paid' : 'pending',
      bill.somme_tot
    ]);

    const csv = [headers, ...rows].map(row => row.map(value => `"${String(value ?? '')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'factures.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private patchBill(updated: Bill): void {
    const index = this.listofbills.findIndex(b => b.facture_id === updated.facture_id);
    if (index >= 0) {
      this.listofbills = this.listofbills.map((bill, idx) => idx === index ? { ...bill, ...updated } : bill);
    }
  }
}
