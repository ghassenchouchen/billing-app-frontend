import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { Offer } from '../../core/models';

@Injectable({
  providedIn: 'root'
})
export class OffersService {
  constructor(private api: ApiService) {}

  getOffers(): Observable<Offer[]> {
    return this.api.get<Offer[]>('offrelist/');
  }

  getOfferDetails(offerId: string): Observable<Offer> {
    return this.api.get<Offer>(`offredetail/${offerId}/`);
  }

  createOffer(request: any): Observable<Offer> {
    return this.api.post<Offer>('offer', request);
  }

  updateOffer(offerId: string, request: any): Observable<Offer> {
    return this.api.put<Offer>(`offer/${offerId}`, request);
  }

  deleteOffer(offerId: string): Observable<void> {
    return this.api.delete<void>(`offer/${offerId}`);
  }
}
