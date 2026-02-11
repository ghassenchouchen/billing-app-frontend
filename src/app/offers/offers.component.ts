import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Offer, Service } from '../core/models';
import { OffersService } from '../shared/services/offers.service';
import { ServicesService } from '../shared/services/services.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css']
})
export class OffersComponent implements OnInit, OnDestroy {
  listofoffers: Offer[] = [];
  offersdetails: Offer | null = null;
  availableServices: Service[] = [];
  showForm = false;
  formMode: 'create' | 'edit' = 'create';
  formData = { libelle: '', serviceId: '' };
  saving = false;
  showConfirmModal = false;
  confirmModalConfig = {
    title: '',
    message: '',
    action: null as (() => void) | null
  };
  private destroy$ = new Subject<void>();

  constructor(private offersService: OffersService, private servicesService: ServicesService) {}

  ngOnInit(): void {
    this.loadOffers();
    this.loadServices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOffers(): void {
    this.offersService.getOffers()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.listofoffers = data;
      });
  }

  loadServices(): void {
    this.servicesService.getServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.availableServices = data;
      });
  }

  detail(id: string): void {
    this.offersService.getOfferDetails(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.offersdetails = data;
      });
  }

  openCreateForm(): void {
    this.formMode = 'create';
    this.formData = { libelle: '', serviceId: '' };
    this.showForm = true;
  }

  openEditForm(offer: any): void {
    this.formMode = 'edit';
    this.formData = { libelle: offer.libelle || offer.nom || offer.code || '', serviceId: '' };
    this.offersdetails = offer;
    this.showForm = true;
  }

  saveOffer(): void {
    if (!this.formData.libelle || !this.formData.serviceId) {
      return;
    }
    this.saving = true;
    const request = {
      libelle: this.formData.libelle,
      serviceIds: [parseInt(this.formData.serviceId, 10)]
    };
    if (this.formMode === 'create') {
      this.offersService.createOffer(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadOffers();
            this.closeForm();
            this.saving = false;
          },
          error: () => {
            this.saving = false;
          }
        });
    } else if (this.offersdetails) {
      this.offersService.updateOffer(String(this.offersdetails.id), request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadOffers();
            this.closeForm();
            this.saving = false;
          },
          error: () => {
            this.saving = false;
          }
        });
    }
  }

  deleteOffer(id: any): void {
    this.confirmModalConfig = {
      title: 'Supprimer l\'offre',
      message: 'Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.',
      action: () => this.confirmDelete(String(id))
    };
    this.showConfirmModal = true;
  }

  confirmDelete(id: string): void {
    this.showConfirmModal = false;
    this.offersService.deleteOffer(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadOffers();
      });
  }

  cancelConfirm(): void {
    this.showConfirmModal = false;
  }

  closeForm(): void {
    this.showForm = false;
    this.formData = { libelle: '', serviceId: '' };
    this.offersdetails = null;
  }
}
