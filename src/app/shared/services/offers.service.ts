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
}
