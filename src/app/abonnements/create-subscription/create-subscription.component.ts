import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Customer, Offer } from '../../core/models';
import { CustomerService } from '../../shared/services/customer.service';
import { OffersService } from '../../shared/services/offers.service';
import { AbonnementService } from '../../shared/services/abonnement.service';

@Component({
  selector: 'app-create-subscription',
  templateUrl: './create-subscription.component.html',
  styleUrls: ['./create-subscription.component.css']
})
export class CreateSubscriptionComponent implements OnInit, OnDestroy {
  currentStep = 1;
  saving = false;
  createdId: number | null = null;
  today = new Date().toISOString().split('T')[0];

  // Step 1: Customer
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  customerSearch = '';
  selectedCustomer: Customer | null = null;
  loadingCustomers = true;

  // Step 2: Offer
  offers: Offer[] = [];
  filteredOffers: Offer[] = [];
  offerFilter = 'Tous';
  selectedOffer: Offer | null = null;
  loadingOffers = true;

  formErrors: { [key: string]: string } = {};
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private customerService: CustomerService,
    private offersService: OffersService,
    private abonnementService: AbonnementService
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
    this.loadOffers();

    const customerRef = this.route.snapshot.paramMap.get('customerRef');
    if (customerRef) {
      this.preSelectCustomer(customerRef);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─── Customer loading ───
  loadCustomers(): void {
    this.loadingCustomers = true;
    this.customerService.getCustomers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.customers = data && data.length ? data : this.getSampleCustomers();
          this.filteredCustomers = this.customers.filter(c => c.status === 'ACTIVE');
          this.loadingCustomers = false;
        },
        error: () => {
          this.customers = this.getSampleCustomers();
          this.filteredCustomers = this.customers.filter(c => c.status === 'ACTIVE');
          this.loadingCustomers = false;
        }
      });
  }

  loadOffers(): void {
    this.loadingOffers = true;
    this.offersService.getOffers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.offers = data && data.length ? data : this.getSampleOffers();
          this.filteredOffers = this.offers.filter(o => o.status === 'ACTIVE' || o.active);
          this.loadingOffers = false;
        },
        error: () => {
          this.offers = this.getSampleOffers();
          this.filteredOffers = this.offers.filter(o => o.status === 'ACTIVE' || o.active);
          this.loadingOffers = false;
        }
      });
  }

  preSelectCustomer(ref: string): void {
    this.customerService.getCustomerDetails(ref)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data) {
            this.selectedCustomer = data;
            this.currentStep = 2;
          }
        },
        error: () => {
          // Will fallback once customers are loaded
          const found = this.customers.find(c => c.customerRef === ref);
          if (found) {
            this.selectedCustomer = found;
            this.currentStep = 2;
          }
        }
      });
  }

  // ─── Customer search ───
  searchCustomers(): void {
    const term = this.customerSearch.toLowerCase().trim();
    this.filteredCustomers = this.customers
      .filter(c => c.status === 'ACTIVE')
      .filter(c => {
        if (!term) return true;
        const fullName = `${c.prenom} ${c.nom}`.toLowerCase();
        return fullName.includes(term) ||
               c.customerRef.toLowerCase().includes(term) ||
               (c.email || '').toLowerCase().includes(term) ||
               (c.telephone || '').includes(term);
      });
  }

  selectCustomer(customer: Customer): void {
    this.selectedCustomer = customer;
    this.formErrors = {};
  }

  clearCustomer(): void {
    this.selectedCustomer = null;
    this.currentStep = 1;
  }

  // ─── Offer selection ───
  setOfferFilter(filter: string): void {
    this.offerFilter = filter;
    const active = this.offers.filter(o => o.status === 'ACTIVE' || o.active);
    if (filter === 'Tous') {
      this.filteredOffers = active;
    } else if (filter === 'Mobile') {
      this.filteredOffers = active.filter(o =>
        (o.libelle || o.nom || '').toLowerCase().match(/mobile|4g|5g|forfait/) ||
        (o.description || '').toLowerCase().match(/appel|sms|data/)
      );
    } else if (filter === 'Internet') {
      this.filteredOffers = active.filter(o =>
        (o.libelle || o.nom || '').toLowerCase().match(/fibre|internet|adsl/)
      );
    } else if (filter === 'B2B') {
      this.filteredOffers = active.filter(o =>
        (o.libelle || o.nom || '').toLowerCase().match(/entreprise|pro|business|convergent/)
      );
    }
  }

  selectOffer(offer: Offer): void {
    this.selectedOffer = offer;
    this.formErrors = {};
  }

  // ─── Wizard navigation ───
  nextStep(): void {
    if (this.currentStep === 1) {
      if (!this.selectedCustomer) {
        this.formErrors['customer'] = 'Veuillez sélectionner un client.';
        return;
      }
      this.formErrors = {};
      this.currentStep = 2;
    } else if (this.currentStep === 2) {
      if (!this.selectedOffer) {
        this.formErrors['offer'] = 'Veuillez sélectionner une offre.';
        return;
      }
      this.formErrors = {};
      this.currentStep = 3;
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step < this.currentStep) {
      this.currentStep = step;
    }
  }

  cancel(): void {
    this.router.navigate(['/Abonnements']);
  }

  // ─── Submit ───
  submit(): void {
    if (!this.selectedCustomer || !this.selectedOffer) return;
    this.saving = true;

    const payload = {
      clientId: this.getCustomerId(this.selectedCustomer),
      offreId: this.selectedOffer.id,
      dateDebut: new Date().toISOString().split('T')[0],
      billingFrequency: 'MONTHLY'
    };

    this.abonnementService.createAbonnement(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (created) => {
          this.saving = false;
          this.createdId = created.id;
          this.router.navigate(['/Abonnements', created.id]);
        },
        error: () => {
          this.saving = false;
          this.formErrors['submit'] = 'Erreur lors de la création. Veuillez réessayer.';
        }
      });
  }

  // ─── Helpers ───
  getCustomerId(c: Customer): number {
    // customerRef format: CLT-2024-001 → extract numeric part, or use 1
    const match = c.customerRef.match(/(\d+)$/);
    return match ? parseInt(match[1], 10) : 1;
  }

  getInitials(c: Customer): string {
    const f = (c.prenom || '').charAt(0).toUpperCase();
    const l = (c.nom || '').charAt(0).toUpperCase();
    return f + l || c.nom.charAt(0).toUpperCase();
  }

  getAvatarColor(c: Customer): string {
    const colors = ['#5b4bff', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981'];
    const name = (c.nom || '') + (c.prenom || '');
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getCustomerFullName(c: Customer): string {
    if (c.type === 'BUSINESS') return c.nom;
    return `${c.prenom} ${c.nom}`.trim();
  }

  getTypeLabel(c: Customer): string {
    return c.type === 'BUSINESS' ? 'Business / B2B' : 'Individu';
  }

  getOfferIcon(offer: Offer): string {
    const name = (offer.libelle || offer.nom || '').toLowerCase();
    if (name.match(/fibre|internet/)) return 'wifi';
    if (name.match(/mobile|4g|5g|forfait/)) return 'smartphone';
    if (name.match(/entreprise|pro|convergent|business/)) return 'business';
    if (name.match(/roaming/)) return 'public';
    return 'redeem';
  }

  getPaymentBadgeClass(offer: Offer): string {
    return (offer.paymentType || '').toUpperCase() === 'PREPAID' ? 'prepaid' : 'postpaid';
  }

  getOfferPrice(offer: Offer): number {
    return offer.prixMensuel || offer.prixBase || 0;
  }

  // ─── Sample Data ───
  private getSampleCustomers(): Customer[] {
    return [
      { customerRef: 'CLT-2024-001', nom: 'Ben Ali', prenom: 'Mohamed', email: 'mohamed.benali@email.tn', telephone: '+216 71 234 567', pieceIdentite: '09876543', adresse: 'Av. Habib Bourguiba, 15', ville: 'Tunis', codePostal: '1000', type: 'INDIVIDUAL', status: 'ACTIVE' },
      { customerRef: 'CLT-2024-002', nom: 'Trabelsi', prenom: 'Amira', email: 'amira.trabelsi@email.tn', telephone: '+216 22 345 678', pieceIdentite: '12345678', adresse: 'Rue de Marseille, 42', ville: 'Tunis', codePostal: '1001', type: 'INDIVIDUAL', status: 'ACTIVE' },
      { customerRef: 'CLT-2024-003', nom: 'Digital Solutions SARL', prenom: '', email: 'contact@digitalsol.tn', telephone: '+216 71 456 789', pieceIdentite: 'RNE-B0147523', adresse: 'Zone Industrielle, Lot 8', ville: 'Sousse', codePostal: '4000', type: 'BUSINESS', status: 'ACTIVE' },
      { customerRef: 'CLT-2024-004', nom: 'Hamdi', prenom: 'Yassine', email: 'yassine.hamdi@email.tn', telephone: '+216 55 123 456', pieceIdentite: '07654321', adresse: 'Rue Ibn Khaldoun, 7', ville: 'Sfax', codePostal: '3000', type: 'INDIVIDUAL', status: 'ACTIVE' },
      { customerRef: 'CLT-2024-005', nom: 'MédiaPlus SARL', prenom: '', email: 'info@mediaplus.tn', telephone: '+216 71 789 012', pieceIdentite: 'RNE-A0298341', adresse: 'Centre Urbain Nord', ville: 'Tunis', codePostal: '1082', type: 'BUSINESS', status: 'ACTIVE' },
      { customerRef: 'CLT-2024-006', nom: 'Gharbi', prenom: 'Fatma', email: 'fatma.gharbi@email.tn', telephone: '+216 98 765 432', pieceIdentite: '11223344', adresse: 'Av. de la République, 23', ville: 'Monastir', codePostal: '5000', type: 'INDIVIDUAL', status: 'SUSPENDED' }
    ];
  }

  private getSampleOffers(): Offer[] {
    return [
      { id: 1, code: 'FIBRE-20M', libelle: 'Fibre Essentiel 20M', description: 'Internet fibre optique 20 Mbps — idéal pour les foyers', prixMensuel: 35.00, status: 'ACTIVE', paymentType: 'POSTPAID', serviceIds: [1, 2] },
      { id: 2, code: 'FIBRE-100M', libelle: 'Fibre Pro 100M', description: 'Internet fibre 100 Mbps — pour les professionnels exigeants', prixMensuel: 89.00, status: 'ACTIVE', paymentType: 'POSTPAID', serviceIds: [1, 2] },
      { id: 3, code: 'MOB-5G-10G', libelle: 'Mobile 5G 10Go', description: 'Forfait mobile 5G avec 10 Go de data + appels illimités', prixMensuel: 25.00, status: 'ACTIVE', paymentType: 'POSTPAID', serviceIds: [1, 2, 3] },
      { id: 4, code: 'MOB-4G-25G', libelle: 'Forfait Mobile 4G 25 Go', description: 'Forfait mobile 4G, 25 Go data, appels & SMS illimités', prixMensuel: 45.00, status: 'ACTIVE', paymentType: 'POSTPAID', serviceIds: [1, 2, 3] },
      { id: 5, code: 'MOB-PREPAID', libelle: 'Prépayé Mobile', description: 'Forfait prépayé flexible — rechargez selon vos besoins', prixMensuel: 15.00, status: 'ACTIVE', paymentType: 'PREPAID', serviceIds: [1, 3] },
      { id: 6, code: 'ENT-CONV', libelle: 'Entreprise Convergent', description: 'Pack convergent entreprise — voix, data, fibre en un seul contrat', prixMensuel: 199.00, status: 'ACTIVE', paymentType: 'POSTPAID', serviceIds: [1, 2, 3, 4] },
      { id: 7, code: 'ROAMING-MAG', libelle: 'Pack Roaming Maghreb', description: 'Roaming voix & data — Algérie, Maroc, Libye, Mauritanie', prixMensuel: 30.00, status: 'ACTIVE', paymentType: 'POSTPAID', serviceIds: [4] },
      { id: 8, code: 'MOB-YOUTH', libelle: 'Forfait Jeune 4G', description: 'Forfait mobile jeune < 25 ans — 15 Go + réseaux sociaux illimités', prixMensuel: 19.90, status: 'ACTIVE', paymentType: 'PREPAID', serviceIds: [1, 2, 3] }
    ];
  }
}
