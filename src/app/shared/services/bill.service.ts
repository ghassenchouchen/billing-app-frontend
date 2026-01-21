import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Bill, BillDetails, InvoiceLine } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  constructor(private api: ApiService) {}

  getBills(): Observable<Bill[]> {
    return this.api.get<Bill[]>('facturelist/');
  }

  getBillsByCustomer(customerId: string): Observable<Bill[]> {
    return this.api.get<Bill[]>(`facturelistbyCustomer/${customerId}/`);
  }

  getBillDetails(billId: string): Observable<BillDetails> {
    return this.api.get<BillDetails>(`facturedetail/${billId}/`);
  }

  getBillLines(billId: string): Observable<InvoiceLine[]> {
    return this.api.get<InvoiceLine[]>(`facturelines/${billId}/`);
  }

  calculateBill(billId: string): Observable<any> {
    const body = { title: 'Angular PUT Request calcul' };
    return this.api.put(`sommefacturebyfactureID/${billId}/`, body);
  }

  runBilling(periodStart: string, periodEnd: string): Observable<Bill[]> {
    return this.api.post<Bill[]>('billing/run', {
      period_start: periodStart,
      period_end: periodEnd
    });
  }
}
