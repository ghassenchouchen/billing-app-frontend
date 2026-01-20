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

  getContractDetails(contractId: string): Observable<Contract> {
    return this.api.get<Contract>(`contratdetail/${contractId}/`);
  }
}
