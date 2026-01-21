import { Injectable } from '@angular/core';
import { forkJoin, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiService } from './api.service';

export interface SearchResult {
  label: string;
  sublabel?: string;
  route: string;
}

export interface SearchSection {
  title: string;
  results: SearchResult[];
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private clients: any[] | null = null;
  private bills: any[] | null = null;
  private contracts: any[] | null = null;
  private services: any[] | null = null;
  private offers: any[] | null = null;

  constructor(private api: ApiService) {}

  search(term: string): Observable<SearchSection[]> {
    const query = (term || '').trim().toLowerCase();
    if (!query) {
      return of([]);
    }

    return this.ensureData().pipe(
      map(() => {
        const sections: SearchSection[] = [];

        const clientResults = (this.clients || [])
          .filter((c) => this.match(query, `${c.nom} ${c.prenom} ${c.email} ${c.adresse} ${c.type}`))
          .map((c) => ({
            label: `${c.prenom} ${c.nom}`.trim(),
            sublabel: c.email,
            route: '/Customers'
          }));
        if (clientResults.length) {
          sections.push({ title: 'Clients', results: clientResults });
        }

        const billResults = (this.bills || [])
          .filter((b) => this.match(query, `facture ${b.facture_id} client ${b.client_id} ${b.paid ? 'payee' : 'attente'}`))
          .map((b) => ({
            label: `Facture #${b.facture_id}`,
            sublabel: `Client ${b.client_id} · ${b.paid ? 'Payée' : 'En attente'}`,
            route: '/Bills'
          }));
        if (billResults.length) {
          sections.push({ title: 'Factures', results: billResults });
        }

        const contractResults = (this.contracts || [])
          .filter((c) => this.match(query, `${c.contract_id} ${c.customer_name} ${c.type} ${c.status}`))
          .map((c) => ({
            label: `Contrat #${c.contract_id}`,
            sublabel: `${c.customer_name || 'Client'} · ${c.status || 'active'}`,
            route: '/Contracts'
          }));
        if (contractResults.length) {
          sections.push({ title: 'Contrats', results: contractResults });
        }

        const serviceResults = (this.services || [])
          .filter((s) => this.match(query, `${s.name} ${s.type} ${s.status}`))
          .map((s) => ({
            label: `${s.name}`,
            sublabel: `${s.type || ''}`.trim(),
            route: '/Services'
          }));
        if (serviceResults.length) {
          sections.push({ title: 'Services', results: serviceResults });
        }

        const offerResults = (this.offers || [])
          .filter((o) => this.match(query, `${o.name} ${o.description} ${o.status}`))
          .map((o) => ({
            label: `${o.name}`,
            sublabel: `${o.description || ''}`.trim(),
            route: '/Offers'
          }));
        if (offerResults.length) {
          sections.push({ title: 'Offres', results: offerResults });
        }

        return sections;
      })
    );
  }

  private ensureData(): Observable<void> {
    const requests: any[] = [];
    if (!this.clients) {
      requests.push(this.api.get<any[]>('clientlist/').pipe(tap((data) => (this.clients = data))));
    }
    if (!this.bills) {
      requests.push(this.api.get<any[]>('facturelist/').pipe(tap((data) => (this.bills = data))));
    }
    if (!this.contracts) {
      requests.push(this.api.get<any[]>('contratlist/').pipe(tap((data) => (this.contracts = data))));
    }
    if (!this.services) {
      requests.push(this.api.get<any[]>('servicelist/').pipe(tap((data) => (this.services = data))));
    }
    if (!this.offers) {
      requests.push(this.api.get<any[]>('offrelist/').pipe(tap((data) => (this.offers = data))));
    }

    if (!requests.length) {
      return of(void 0);
    }

    return forkJoin(requests).pipe(map(() => void 0));
  }

  private match(term: string, haystack: string): boolean {
    return (haystack || '').toLowerCase().includes(term);
  }
}
