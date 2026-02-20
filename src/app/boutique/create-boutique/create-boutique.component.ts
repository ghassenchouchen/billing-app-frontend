import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BoutiqueApiService, Boutique } from '../../core/services/boutique-api.service';
import { UserService, UserDto } from '../../core/services/user.service';

@Component({
  selector: 'app-create-boutique',
  templateUrl: './create-boutique.component.html',
  styleUrls: ['./create-boutique.component.css']
})
export class CreateBoutiqueComponent implements OnInit, OnDestroy {
  // Id
  code = '';
  nom = '';

  // Localisation
  adresse = '';
  ville = '';
  codePostal = '';

  // Contact
  telephone = '';
  email = '';

  // Responsable
  responsableId: number | null = null;
  responsables: UserDto[] = [];

  // State
  saving = false;
  errorMessage = '';
  successMessage = '';

  private destroy$ = new Subject<void>();

  constructor(
    private boutiqueApi: BoutiqueApiService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadResponsables();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadResponsables(): void {
    this.userService.getUsersByRole('RESPONSABLE_BOUTIQUE')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => {
          this.responsables = users.filter(u => u.status === 'ACTIVE');
        },
        error: () => {
          // Fallback mock data
          this.responsables = [
            { id: 2, username: 'm.durand', firstName: 'Marc', lastName: 'Durand', role: 'RESPONSABLE_BOUTIQUE', status: 'ACTIVE', boutiqueId: 1, lastLoginAt: null, createdAt: '2025-03-15' },
            { id: 7, username: 'a.mejri', firstName: 'Ahmed', lastName: 'Mejri', role: 'RESPONSABLE_BOUTIQUE', status: 'ACTIVE', boutiqueId: null, lastLoginAt: null, createdAt: '2025-05-01' },
          ];
        }
      });
  }

  generateCode(): void {
    if (!this.ville) return;
    const prefix = this.ville.substring(0, 3).toUpperCase().replace(/\s/g, '');
    const num = Math.floor(100 + Math.random() * 900);
    this.code = `BQ-${prefix}-${num}`;
  }

  get formValid(): boolean {
    return !!(this.code && this.nom && this.adresse && this.ville && this.telephone);
  }

  submitForm(): void {
    if (!this.formValid || this.saving) return;

    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const boutique: Partial<Boutique> = {
      code: this.code,
      nom: this.nom,
      adresse: this.adresse,
      ville: this.ville,
      codePostal: this.codePostal,
      telephone: this.telephone,
      email: this.email,
      responsableId: this.responsableId
    };

    this.boutiqueApi.create(boutique)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.successMessage = 'Boutique créée avec succès !';
          this.saving = false;
          setTimeout(() => this.router.navigate(['/Boutiques']), 1500);
        },
        error: (err) => {
          this.saving = false;
          this.errorMessage = err.error?.message || 'Erreur lors de la création de la boutique.';
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/Boutiques']);
  }
}
