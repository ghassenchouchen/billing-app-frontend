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

  detail(id: any): void {
    this.billService.getBillDetails(String(id))
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.billdetails = data;
        this.notpaid = data.statut !== 'PAID';
        this.notcalculated = data.montantTTC === 0;
        this.billLines = data.lines || [];
      });
  }

  Calculate(id: any): void {
  
    this.calculatingId = String(id);
    this.billService.finalizeInvoice(String(id))
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.post_sum = data;
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
      const billDate = new Date(bill.dateFacture);
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

    const headers = ['numeroFacture', 'clientId', 'dateFacture', 'dateEcheance', 'montantHT', 'montantTVA', 'montantTTC', 'statut'];
    const rows = this.listofbills.map(bill => [
      bill.numeroFacture,
      bill.clientId,
      bill.dateFacture,
      bill.dateEcheance,
      bill.montantHT,
      bill.montantTVA,
      bill.montantTTC,
      bill.statut
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

    this.billService.getBillDetails(String(bill.id))
      .pipe(takeUntil(this.destroy$))
      .subscribe((details) => {
        const lines = details.lines || [];
        const headers = ['numeroFacture', 'description', 'quantite', 'prixUnitaire', 'montantHT'];
        const rows = lines.map(line => [
          bill.numeroFacture,
          line.description || '',
          line.quantite ?? '',
          line.prixUnitaire ?? '',
          line.montant ?? ''
        ]);

        if (!rows.length) {
          rows.push([
            bill.numeroFacture,
            'Total',
            '1',
            bill.montantHT?.toString() ?? '',
            bill.montantTTC?.toString() ?? ''
          ]);
        }

        const csv = [headers, ...rows]
          .map(row => row.map(value => `"${String(value ?? '')}"`).join(','))
          .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `facture-${bill.numeroFacture}.csv`;
        link.click();
        window.URL.revokeObjectURL(url);
      });
  }

  private patchBill(updated: Bill): void {
    const index = this.listofbills.findIndex(b => b.id === updated.id || b.numeroFacture === updated.numeroFacture);
    if (index >= 0) {
      this.listofbills = this.listofbills.map((bill, idx) => idx === index ? { ...bill, ...updated } : bill);
    }
  }
}
