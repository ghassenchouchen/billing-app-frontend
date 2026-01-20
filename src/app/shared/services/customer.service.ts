import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Customer, CustomerDetails } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  constructor(private api: ApiService) {}

  getCustomers(): Observable<Customer[]> {
    return this.api.get<Customer[]>('clientlist/');
  }

  getCustomerDetails(clientId: string): Observable<CustomerDetails> {
    return this.api.get<CustomerDetails>(`clientdetail/${clientId}/`);
  }
}
