import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Contract } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  constructor(private api: ApiService) {}

  getContracts(): Observable<Contract[]> {
    return this.api.get<Contract[]>('contratlist/');
  }

  getContractsByCustomer(customerId: string): Observable<Contract[]> {
    return this.api.get<Contract[]>(`contratlistbyClient/${customerId}/`);
  }

  getContractDetails(contractId: string): Observable<Contract> {
    return this.api.get<Contract>(`contratdetail/${contractId}/`);
  }

  deactivateContract(contractId: string): Observable<Contract> {
    return this.api.put<Contract>(`contract/${contractId}/deactivate`, {});
  }

  requestCancellation(contractId: string): Observable<Contract> {
    return this.api.post<Contract>(`contract/${contractId}/cancel-request`, {});
  }
}
