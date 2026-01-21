import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Bill, BillDetails, InvoiceLine } from '../core/models';
import { BillService } from '../shared/services/bill.service';

@Component({
  selector: 'app-bills',
  templateUrl: './bills.component.html',
  styleUrls: ['./bills.component.css']
})
export class BillsComponent implements OnInit, OnDestroy {
  notpaid: boolean = false;
  notcalculated: boolean = false;
  listofbills: Bill[] = [];
  allBills: Bill[] = [];
  billdetails: BillDetails | null = null;
  billLines: InvoiceLine[] = [];
  filterStart = '';
  filterEnd = '';
  calculatingId: string | null = null;
  post_sum: any;
  private destroy$ = new Subject<void>();

  constructor(private billService: BillService) {}

  ngOnInit(): void {
    this.billService.getBills()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.allBills = data;
        this.listofbills = data;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  detail(id: string): void {
    this.billService.getBillDetails(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.billdetails = data;
        this.notpaid = !data.paid;
        this.notcalculated = data.somme_tot === 0;

        this.billService.getBillLines(id)
          .pipe(takeUntil(this.destroy$))
          .subscribe((lines) => {
            this.billLines = lines;
          });

      });
  }

  Calculate(id: string): void {
    this.calculatingId = id;
    this.billService.calculateBill(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.post_sum = data;
        if (this.billdetails && String(this.billdetails.facture_id) === String(id)) {
          this.billdetails = data as BillDetails;
          this.notcalculated = data.somme_tot === 0;
          this.billService.getBillLines(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe((lines) => {
              this.billLines = lines;
            });
        }
        this.patchBill(data);
        this.calculatingId = null;
      });
  }

  filterBills(): void {
    if (!this.filterStart || !this.filterEnd) {
      return;
    }
    const startDate = new Date(this.filterStart);
    const endDate = new Date(this.filterEnd);
    
    this.listofbills = this.allBills.filter(bill => {
      if (!bill.issue_date) return false;
      const billDate = new Date(bill.issue_date);
      return billDate >= startDate && billDate <= endDate;
    });
  }

  clearFilter(): void {
    this.filterStart = '';
    this.filterEnd = '';
    this.listofbills = this.allBills;
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

  exportBill(bill: Bill): void {
    if (!bill) {
      return;
    }

    this.billService.getBillLines(bill.facture_id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((lines) => {
        const headers = ['facture_id', 'service', 'quantity', 'unit_price', 'amount'];
        const rows = (lines || []).map(line => [
          bill.facture_id,
          line.service_name || line.service_id || '',
          line.quantity ?? '',
          line.unit_price ?? '',
          line.amount ?? ''
        ]);

        if (!rows.length) {
          rows.push([
            bill.facture_id,
            '',
            bill.consom_appel ?? '',
            bill.consom_sms ?? '',
            bill.consom_internet ?? ''
          ]);
          headers.push('consom_appel', 'consom_sms', 'consom_internet');
        }

        const csv = [headers, ...rows]
          .map(row => row.map(value => `"${String(value ?? '')}"`).join(','))
          .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `facture-${bill.facture_id}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      });
  }

  private patchBill(updated: Bill): void {
    const index = this.listofbills.findIndex(b => b.facture_id === updated.facture_id);
    if (index >= 0) {
      this.listofbills = this.listofbills.map((bill, idx) => idx === index ? { ...bill, ...updated } : bill);
    }
  }
}
