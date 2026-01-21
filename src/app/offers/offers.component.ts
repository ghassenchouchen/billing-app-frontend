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
  formData = { name: '', service_id: '' };
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
    this.formData = { name: '', service_id: '' };
    this.showForm = true;
  }

  openEditForm(offer: Offer): void {
    this.formMode = 'edit';
    this.formData = { name: offer.name, service_id: '' };
    this.offersdetails = offer;
    this.showForm = true;
  }

  saveOffer(): void {
    if (!this.formData.name || !this.formData.service_id) {
      return;
    }
    this.saving = true;
    const request = {
      offre_parent: this.formData.name,
      service_id: this.formData.service_id
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
      this.offersService.updateOffer(this.offersdetails.offre_id, request)
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

  deleteOffer(id: string): void {
    this.confirmModalConfig = {
      title: 'Supprimer l\'offre',
      message: 'Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.',
      action: () => this.confirmDelete(id)
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
    this.formData = { name: '', service_id: '' };
    this.offersdetails = null;
  }
}
