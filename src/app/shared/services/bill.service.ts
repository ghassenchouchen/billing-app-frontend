import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Bill, BillDetails } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class BillService {
  constructor(private api: ApiService) {}

  getBills(): Observable<Bill[]> {
    return this.api.get<Bill[]>('facturelist/');
  }

  getBillDetails(billId: string): Observable<BillDetails> {
    return this.api.get<BillDetails>(`facturedetail/${billId}/`);
  }

  payBill(billId: string): Observable<any> {
    const body = { title: 'Angular PUT Request pay' };
    return this.api.put(`checkpaidfacturebyID/${billId}/`, body);
  }

  calculateBill(billId: string): Observable<any> {
    const body = { title: 'Angular PUT Request calcul' };
    return this.api.put(`sommefacturebyfactureID/${billId}/`, body);
  }
}
