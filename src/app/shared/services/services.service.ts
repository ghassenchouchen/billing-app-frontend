import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Service } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class ServicesService {
  constructor(private api: ApiService) {}

  getServices(): Observable<Service[]> {
    return this.api.get<Service[]>('servicelist/');
  }

  getServiceDetails(serviceId: string): Observable<Service> {
    return this.api.get<Service>(`servicedetail/${serviceId}/`);
  }
}
