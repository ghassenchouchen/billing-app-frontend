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

  createService(request: any): Observable<Service> {
    return this.api.post<Service>('service', request);
  }

  updateService(serviceId: string, request: any): Observable<Service> {
    return this.api.put<Service>(`service/${serviceId}`, request);
  }

  deleteService(serviceId: string): Observable<void> {
    return this.api.delete<void>(`service/${serviceId}`);
  }
}
