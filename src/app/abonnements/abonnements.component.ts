import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AbonnementService } from '../shared/services/abonnement.service';
import { Abonnement } from '../core/models';

@Component({
  selector: 'app-abonnements',
  templateUrl: './abonnements.component.html',
  styleUrls: ['./abonnements.component.css']
})
export class AbonnementsComponent implements OnInit, OnDestroy {
  listofAbonnements: Abonnement[] = [];
  abonnementDetails: Abonnement | null = null;
  deactivatingId: string | null = null;
  showConfirmModal = false;
  confirmModalConfig = {
    title: '',
    message: '',
    action: null as (() => void) | null
  };
  private destroy$ = new Subject<void>();

  constructor(private abonnementService: AbonnementService) {}

  ngOnInit(): void {
    this.abonnementService.getAbonnements()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.listofAbonnements = data;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  detail(id: string): void {
    this.abonnementService.getAbonnementDetails(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.abonnementDetails = data;
      });
  }

  deactivate(id: any): void {
    this.confirmModalConfig = {
      title: 'Suspendre l\'abonnement',
      message: 'Êtes-vous sûr de vouloir suspendre cet abonnement ? Cette action peut avoir des conséquences sur la facturation.',
      action: () => this.confirmDeactivate(String(id))
    };
    this.showConfirmModal = true;
  }

  confirmDeactivate(id: string): void {
    this.showConfirmModal = false;
    this.deactivatingId = id;
    this.abonnementService.suspendAbonnement(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.patchAbonnement(data);
        if (this.abonnementDetails && String(this.abonnementDetails.id) === id) {
          this.abonnementDetails = data;
        }
        this.deactivatingId = null;
      });
  }

  cancelConfirm(): void {
    this.showConfirmModal = false;
  }

  private patchAbonnement(updated: Abonnement): void {
    const index = this.listofAbonnements.findIndex(a => a.id === updated.id);
    if (index >= 0) {
      this.listofAbonnements = this.listofAbonnements.map((abonnement, idx) => idx === index ? { ...abonnement, ...updated } : abonnement);
    }
  }
}
