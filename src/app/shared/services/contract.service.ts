import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contract } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class ContractService {
  private baseUrl = '/api/subscriptions';

  constructor(private http: HttpClient) {}

  getContracts(): Observable<Contract[]> {
    return this.http.get<Contract[]>(this.baseUrl);
  }

  getActiveContracts(): Observable<Contract[]> {
    return this.http.get<Contract[]>(`${this.baseUrl}/active`);
  }

  getContractsByCustomer(clientId: string): Observable<Contract[]> {
    return this.http.get<Contract[]>(`${this.baseUrl}/client/${clientId}`);
  }

  getContractDetails(contractId: string): Observable<Contract> {
    return this.http.get<Contract>(`${this.baseUrl}/${contractId}`);
  }

  createContract(contract: any): Observable<Contract> {
    return this.http.post<Contract>(this.baseUrl, contract);
  }

  activateContract(contractId: string): Observable<Contract> {
    return this.http.post<Contract>(`${this.baseUrl}/${contractId}/activate`, null);
  }

  suspendContract(contractId: string): Observable<Contract> {
    return this.http.post<Contract>(`${this.baseUrl}/${contractId}/suspend`, null);
  }

  terminateContract(contractId: string): Observable<Contract> {
    return this.http.post<Contract>(`${this.baseUrl}/${contractId}/terminate`, null);
  }

  requestCancellation(contractId: string): Observable<Contract> {
    // Maps to terminate for cancellation request
    return this.http.post<Contract>(`${this.baseUrl}/${contractId}/terminate`, null);
  }
}
