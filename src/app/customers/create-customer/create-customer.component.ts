import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CustomerService } from '../../shared/services/customer.service';
import { OffersService } from '../../shared/services/offers.service';
import { Offer } from '../../core/models';

@Component({
  selector: 'app-create-customer',
  templateUrl: './create-customer.component.html',
  styleUrls: ['./create-customer.component.css']
})
export class CreateCustomerComponent implements OnDestroy {
  currentStep = 1;
  saving = false;

  // Step 1 — Client data
  clientForm = {
    type: 'Individu',
    nom: '',
    prenom: '',
    pieceIdentite: '',
    telephone: '',
    email: '',
    adresse: ''
  };

  // Step 2 — Subscription
  availableOffers: Offer[] = [];
  selectedOfferId: number | null = null;
  paymentType = 'POSTPAID';

  // Validation
  formErrors: { [key: string]: string } = {};

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private customerService: CustomerService,
    private offersService: OffersService
  ) {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Navigation ──
  cancel(): void {
    this.router.navigate(['/Customers']);
  }

  nextStep(): void {
    if (this.currentStep === 1 && this.validateStep1()) {
      this.currentStep = 2;
      this.loadOffers();
    } else if (this.currentStep === 2 && this.validateStep2()) {
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

  // ── Validation ──
  validateStep1(): boolean {
    this.formErrors = {};
    if (!this.clientForm.nom.trim()) {
      this.formErrors['nom'] = 'Le nom est requis';
    }
    if (this.clientForm.type === 'RESIDENTIAL' && !this.clientForm.prenom.trim()) {
      this.formErrors['prenom'] = 'Le prénom est requis';
    }
    if (!this.clientForm.email.trim()) {
      this.formErrors['email'] = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.clientForm.email)) {
      this.formErrors['email'] = 'Email invalide';
    }
    if (!this.clientForm.telephone.trim()) {
      this.formErrors['telephone'] = 'Le téléphone est requis';
    }
    return Object.keys(this.formErrors).length === 0;
  }

  validateStep2(): boolean {
    this.formErrors = {};
    if (!this.selectedOfferId) {
      this.formErrors['offer'] = 'Veuillez sélectionner une offre';
    }
    return Object.keys(this.formErrors).length === 0;
  }

  // ── Data loading ──
  loadOffers(): void {
    this.offersService.getOffers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.availableOffers = (data && data.length) ? data.filter(o => o.status === 'ACTIVE') : this.getSampleOffers();
        },
        error: () => {
          this.availableOffers = this.getSampleOffers();
        }
      });
  }

  selectOffer(id: number): void {
    this.selectedOfferId = this.selectedOfferId === id ? null : id;
  }

  getSelectedOffer(): Offer | null {
    if (!this.selectedOfferId) return null;
    return this.availableOffers.find(o => o.id === this.selectedOfferId) || null;
  }

  // ── Submit ──
  submit(): void {
    this.saving = true;
    const customerPayload = {
      nom: this.clientForm.nom,
      prenom: this.clientForm.prenom || '',
      email: this.clientForm.email,
      telephone: this.clientForm.telephone.startsWith('+216')
        ? this.clientForm.telephone
        : '+216 ' + this.clientForm.telephone,
      adresse: this.clientForm.adresse,
      type: this.clientForm.type,
      ville: '',
      codePostal: ''
    };

    this.customerService.createCustomer(customerPayload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving = false;
          this.router.navigate(['/Customers']);
        },
        error: () => {
          this.saving = false;
          // Still navigate on error (demo mode)
          this.router.navigate(['/Customers']);
        }
      });
  }

  resetForm(): void {
    this.clientForm = {
      type: 'RESIDENTIAL', nom: '', prenom: '',
      pieceIdentite: '', telephone: '', email: '', adresse: ''
    };
    this.formErrors = {};
  }

  getOfferIcon(offer: Offer): string {
    const name = (offer.libelle || '').toLowerCase();
    if (name.includes('fibre')) return 'wifi';
    if (name.includes('5g') || name.includes('4g') || name.includes('mobile')) return 'smartphone';
    if (name.includes('entreprise') || name.includes('business')) return 'business';
    if (name.includes('data') || name.includes('recharge')) return 'language';
    if (name.includes('roaming')) return 'public';
    return 'redeem';
  }

  getTypeLabel(): string {
    return this.clientForm.type === 'BUSINESS' ? 'Business' : 'Individu';
  }

  private getSampleOffers(): Offer[] {
    return [
      { id: 1, code: 'FIBRE_20', libelle: 'Fibre Essentiel 20M', description: 'Connexion fibre optique 20 Mbps', prixMensuel: 35.00, status: 'ACTIVE', paymentType: 'POSTPAID' },
      { id: 3, code: 'MOB_5G_ILL', libelle: 'Mobile 5G Illimité', description: 'Appels & SMS illimités + 100 Go 5G', prixMensuel: 75.00, status: 'ACTIVE', paymentType: 'POSTPAID' },
      { id: 4, code: 'MOB_4G_25', libelle: 'Forfait Mobile 4G 25 Go', description: '25 Go data 4G + 2h d\'appels', prixMensuel: 19.90, status: 'ACTIVE', paymentType: 'PREPAID' },
      { id: 5, code: 'MOB_4G_10', libelle: 'Forfait Mobile 4G 10 Go', description: '10 Go data 4G + 1h d\'appels', prixMensuel: 12.00, status: 'ACTIVE', paymentType: 'PREPAID' },
      { id: 6, code: 'PRO_CONV', libelle: 'Entreprise Convergent', description: 'Fibre 200M + 5 lignes mobiles + IP', prixMensuel: 280.00, status: 'ACTIVE', paymentType: 'POSTPAID' },
    ];
  }
}
