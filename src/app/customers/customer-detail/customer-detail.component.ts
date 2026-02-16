import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CustomerDetails, Abonnement, Bill } from '../../core/models';
import { CustomerService } from '../../shared/services/customer.service';

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.css']
})
export class CustomerDetailComponent implements OnInit, OnDestroy {
  customer: CustomerDetails | null = null;
  loading = true;
  error = false;
  showEditMode = false;
  editData = { nom: '', prenom: '', email: '', telephone: '', adresse: '', ville: '', codePostal: '' };
  saving = false;
  showConfirmSuspend = false;

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService
  ) {}

  ngOnInit(): void {
    const ref = this.route.snapshot.paramMap.get('ref');
    if (ref) {
      this.loadCustomer(ref);
    } else {
      this.error = true;
      this.loading = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCustomer(ref: string): void {
    this.loading = true;
    this.customerService.getCustomerDetails(ref)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.customer = data || this.getSampleCustomerDetails(ref);
          this.loading = false;
        },
        error: () => {
          this.customer = this.getSampleCustomerDetails(ref);
          this.loading = false;
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/Customers']);
  }

  getInitials(): string {
    if (!this.customer) return '';
    const f = (this.customer.prenom || '').charAt(0).toUpperCase();
    const l = (this.customer.nom || '').charAt(0).toUpperCase();
    return f + l;
  }

  getAvatarColor(): string {
    if (!this.customer) return '#5b4bff';
    const colors = ['#5b4bff', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981'];
    const name = (this.customer.nom || '') + (this.customer.prenom || '');
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getFullName(): string {
    if (!this.customer) return '';
    if (this.customer.type === 'BUSINESS') return this.customer.nom;
    return `${this.customer.prenom} ${this.customer.nom}`.trim();
  }

  getTypeLabel(): string {
    if (!this.customer) return '';
    return this.customer.type === 'BUSINESS' ? 'Business / B2B' : 'Individu';
  }

  getStatusLabel(): string {
    if (!this.customer?.status) return 'Inconnu';
    switch (this.customer.status) {
      case 'ACTIVE': return 'Actif';
      case 'SUSPENDED': return 'Suspendu';
      default: return this.customer.status;
    }
  }

  getStatusClass(): string {
    if (!this.customer?.status) return 'neutral';
    switch (this.customer.status) {
      case 'ACTIVE': return 'success';
      case 'SUSPENDED': return 'warning';
      default: return 'neutral';
    }
  }

  getFormattedDate(dateStr?: string): string {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-TN', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }

  getActiveAbonnements(): Abonnement[] {
    if (!this.customer?.abonnements) return [];
    return this.customer.abonnements.filter(a => a.status === 'ACTIVE' || !a.status);
  }

  getOfferIcon(offreId: number): string {
    // Map by offer id pattern
    if (offreId <= 2) return 'wifi';
    if (offreId <= 5) return 'smartphone';
    if (offreId === 6) return 'business';
    return 'redeem';
  }

  getOfferName(offreId: number): string {
    const names: { [key: number]: string } = {
      1: 'Fibre Essentiel 20M',
      2: 'Fibre Pro 100M',
      3: 'Mobile 5G 10Go',
      4: 'Forfait Mobile 4G 25 Go',
      5: 'Entreprise Convergent',
      6: 'Pack Roaming Maghreb'
    };
    return names[offreId] || `Offre #${offreId}`;
  }

  getUnpaidBills(): Bill[] {
    if (!this.customer?.bills) return [];
    return this.customer.bills.filter(b => b.statut === 'IMPAYEE' || b.statut === 'EN_RETARD');
  }

  getLatestBill(): Bill | null {
    if (!this.customer?.bills || !this.customer.bills.length) return null;
    return this.customer.bills.sort((a, b) =>
      new Date(b.dateFacture).getTime() - new Date(a.dateFacture).getTime()
    )[0];
  }

  getBalanceStatus(): string {
    const unpaid = this.getUnpaidBills().length;
    if (unpaid === 0) return 'Pas d\'impayés';
    return `${unpaid} facture${unpaid > 1 ? 's' : ''} impayée${unpaid > 1 ? 's' : ''}`;
  }

  openEditMode(): void {
    if (!this.customer) return;
    this.editData = {
      nom: this.customer.nom,
      prenom: this.customer.prenom,
      email: this.customer.email,
      telephone: this.customer.telephone || '',
      adresse: this.customer.adresse,
      ville: this.customer.ville || '',
      codePostal: this.customer.codePostal || ''
    };
    this.showEditMode = true;
  }

  cancelEdit(): void {
    this.showEditMode = false;
  }

  saveEdit(): void {
    if (!this.customer) return;
    this.saving = true;
    this.customerService.updateCustomer(this.customer.customerRef, this.editData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          Object.assign(this.customer!, this.editData);
          this.showEditMode = false;
          this.saving = false;
        },
        error: () => { this.saving = false; }
      });
  }

  suspendCustomer(): void {
    if (!this.customer) return;
    this.customerService.suspendCustomer(this.customer.customerRef, 'Suspension manuelle')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.customer!.status = 'SUSPENDED';
          this.showConfirmSuspend = false;
        },
        error: () => { this.showConfirmSuspend = false; }
      });
  }

  reactivateCustomer(): void {
    if (!this.customer) return;
    this.customerService.reactivateCustomer(this.customer.customerRef)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.customer!.status = 'ACTIVE';
        }
      });
  }

  navigateToBills(): void {
    this.router.navigate(['/Bills']);
  }

  createSubscription(): void {
    if (this.customer) {
      this.router.navigate(['/Abonnements/new', this.customer.customerRef]);
    }
  }

  private getSampleCustomerDetails(ref: string): CustomerDetails {
    const samples: { [key: string]: CustomerDetails } = {
      'CLT-2024-001': {
        customerRef: 'CLT-2024-001', nom: 'Ben Ali', prenom: 'Mohamed',
        email: 'mohamed.benali@email.tn', telephone: '+216 71 234 567',
        adresse: 'Av. Habib Bourguiba, 15', ville: 'Tunis', codePostal: '1000',
        type: 'INDIVIDUAL', status: 'ACTIVE', accountBalance: 45.50, creditLimit: 200,
        createdAt: '2024-10-24',
        abonnements: [
          { id: 1, clientId: 1, offreId: 4, dateDebut: '2024-10-24', status: 'ACTIVE' },
          { id: 2, clientId: 1, offreId: 7, dateDebut: '2024-11-01', status: 'ACTIVE' }
        ],
        bills: [
          { id: 1, numeroFacture: 'FAC-2024-0001', clientId: 1, dateFacture: '2024-11-01', dateEcheance: '2024-11-30', montantTotal: 27.90, statut: 'PAYEE' } as any
        ]
      },
      'CLT-2024-003': {
        customerRef: 'CLT-2024-003', nom: 'Digital Solutions SARL', prenom: '',
        email: 'contact@digitalsol.tn', telephone: '+216 71 456 789',
        adresse: 'Zone Industrielle, Lot 8', ville: 'Sousse', codePostal: '4000',
        type: 'BUSINESS', status: 'ACTIVE', accountBalance: 1250.00, creditLimit: 5000,
        createdAt: '2024-10-23',
        abonnements: [
          { id: 3, clientId: 3, offreId: 6, dateDebut: '2024-10-23', status: 'ACTIVE' },
          { id: 4, clientId: 3, offreId: 2, dateDebut: '2024-10-25', status: 'ACTIVE' }
        ],
        bills: [
          { id: 2, numeroFacture: 'FAC-2024-0012', clientId: 3, dateFacture: '2024-11-01', dateEcheance: '2024-11-30', montantTotal: 365.00, statut: 'IMPAYEE' } as any
        ]
      }
    };

    return samples[ref] || {
      customerRef: ref, nom: 'Client', prenom: 'Inconnu',
      email: 'client@email.tn', telephone: '+216 00 000 000',
      adresse: 'Adresse non disponible', ville: '', codePostal: '',
      type: 'INDIVIDUAL', status: 'ACTIVE', accountBalance: 0, creditLimit: 150,
      createdAt: '2024-01-01', abonnements: [], bills: []
    };
  }
}
