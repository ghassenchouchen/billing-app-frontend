import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Service } from '../core/models';
import { ServicesService } from '../shared/services/services.service';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit, OnDestroy {
  listofServices: Service[] = [];
  servicedetails: Service | null = null;
  showForm = false;
  formMode: 'create' | 'edit' = 'create';
  formData = { designation: '', prix_unite: 0, unite: 'OCTET', included_quantity: 0 };
  saving = false;
  showConfirmModal = false;
  confirmModalConfig = {
    title: '',
    message: '',
    action: null as (() => void) | null
  };
  private destroy$ = new Subject<void>();

  constructor(private serviceService: ServicesService) {}

  ngOnInit(): void {
    this.loadServices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadServices(): void {
    this.serviceService.getServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.listofServices = data;
      });
  }

  detail(id: string): void {
    this.serviceService.getServiceDetails(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.servicedetails = data;
      });
  }

  openCreateForm(): void {
    this.formMode = 'create';
    this.formData = { designation: '', prix_unite: 0, unite: 'OCTET', included_quantity: 0 };
    this.showForm = true;
  }

  openEditForm(service: Service): void {
    this.formMode = 'edit';
    this.formData = {
      designation: service.name,
      prix_unite: service.price,
      unite: service.type.toUpperCase(),
      included_quantity: service.included_quantity || 0
    };
    this.servicedetails = service;
    this.showForm = true;
  }

  saveService(): void {
    if (!this.formData.designation) {
      return;
    }
    this.saving = true;
    const request = {
      designation: this.formData.designation,
      prix_unite: this.formData.prix_unite,
      unite: this.formData.unite,
      included_quantity: this.formData.included_quantity
    };
    if (this.formMode === 'create') {
      this.serviceService.createService(request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadServices();
            this.closeForm();
            this.saving = false;
          },
          error: () => {
            this.saving = false;
          }
        });
    } else if (this.servicedetails) {
      this.serviceService.updateService(this.servicedetails.service_id, request)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.loadServices();
            this.closeForm();
            this.saving = false;
          },
          error: () => {
            this.saving = false;
          }
        });
    }
  }

  deleteService(id: string): void {
    this.confirmModalConfig = {
      title: 'Supprimer le service',
      message: 'Êtes-vous sûr de vouloir supprimer ce service ? Cette action est irréversible.',
      action: () => this.confirmDelete(id)
    };
    this.showConfirmModal = true;
  }

  confirmDelete(id: string): void {
    this.showConfirmModal = false;
    this.serviceService.deleteService(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadServices();
      });
  }

  cancelConfirm(): void {
    this.showConfirmModal = false;
  }

  closeForm(): void {
    this.showForm = false;
    this.formData = { designation: '', prix_unite: 0, unite: 'OCTET', included_quantity: 0 };
    this.servicedetails = null;
  }
}
