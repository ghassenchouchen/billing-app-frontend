import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CustomerService } from '../shared/services/customer.service';
import { Customer, CustomerDetails } from '../core/models';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit, OnDestroy {
  listOfCustomer: Customer[] = [];
  filteredCustomers: Customer[] = [];
  customerdetails: CustomerDetails | null = null;

  searchTerm = '';
  typeFilter = '';
  statusFilter = '';
  showCreateForm = false;
  saving = false;
  formData = {
    nom: '', prenom: '', email: '', telephone: '',
    adresse: '', ville: '', codePostal: '', type: 'RESIDENTIAL'
  };

  private destroy$ = new Subject<void>();

  get totalCount(): number { return this.listOfCustomer.length; }
  get activeCount(): number { return this.listOfCustomer.filter(c => c.status === 'ACTIVE').length; }

  get hasActiveFilters(): boolean {
    return !!(this.searchTerm || this.typeFilter || this.statusFilter);
  }

  constructor(private customerService: CustomerService, private router: Router) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCustomers(): void {
    this.customerService.getCustomers()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.listOfCustomer = data && data.length ? data : this.getSampleCustomers();
          this.filteredCustomers = this.listOfCustomer;
        },
        error: () => {
          this.listOfCustomer = this.getSampleCustomers();
          this.filteredCustomers = this.listOfCustomer;
        }
      });
  }

  applyFilters(): void {
    let filtered = [...this.listOfCustomer];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        (c.nom && c.nom.toLowerCase().includes(term)) ||
        (c.prenom && c.prenom.toLowerCase().includes(term)) ||
        (c.email && c.email.toLowerCase().includes(term)) ||
        (c.customerRef && c.customerRef.toLowerCase().includes(term)) ||
        (c.telephone && c.telephone.includes(term))
      );
    }

    if (this.typeFilter) {
      filtered = filtered.filter(c => c.type === this.typeFilter);
    }

    if (this.statusFilter) {
      if (this.statusFilter === 'INACTIVE') {
        filtered = filtered.filter(c => c.status !== 'ACTIVE');
      } else {
        filtered = filtered.filter(c => c.status === this.statusFilter);
      }
    }

    this.filteredCustomers = filtered;
  }

  setFilter(kind: string, value: string): void {
    if (kind === 'status') {
      this.statusFilter = this.statusFilter === value ? '' : value;
      this.typeFilter = '';
    } else {
      this.typeFilter = this.typeFilter === value ? '' : value;
      this.statusFilter = '';
    }
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.typeFilter = '';
    this.statusFilter = '';
    this.filteredCustomers = this.listOfCustomer;
  }

  detail(ref: string): void {
    this.router.navigate(['/Customers', ref]);
  }

  closeDetails(): void {
    this.customerdetails = null;
  }

  openCreateForm(): void {
    this.router.navigate(['/Customers/new']);
  }

  closeCreateForm(): void {
    this.showCreateForm = false;
  }

  saveCustomer(): void {
    if (!this.formData.nom || !this.formData.prenom || !this.formData.email) return;
    this.saving = true;
    this.customerService.createCustomer(this.formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.loadCustomers();
          this.closeCreateForm();
          this.saving = false;
        },
        error: () => { this.saving = false; }
      });
  }

  getInitials(customer: any): string {
    const f = (customer.prenom || '').charAt(0).toUpperCase();
    const l = (customer.nom || '').charAt(0).toUpperCase();
    return f + l;
  }

  getAvatarColor(customer: any): string {
    const colors = ['#5b4bff', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#10b981'];
    const name = (customer.nom || '') + (customer.prenom || '');
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getTypeIcon(type: string): string {
    switch ((type || '').toUpperCase()) {
      case 'BUSINESS': case 'B2B': case 'ENTREPRISE': return 'business';
      default: return 'person';
    }
  }

  private getSampleCustomers(): Customer[] {
    return [
      { customerRef: 'CLT-2024-001', nom: 'Ben Ali', prenom: 'Mohamed', email: 'mohamed.benali@email.tn', telephone: '+216 71 234 567', adresse: 'Av. Habib Bourguiba, 15', ville: 'Tunis', codePostal: '1000', type: 'RESIDENTIAL', status: 'ACTIVE', accountBalance: 45.50, creditLimit: 200, createdAt: '2024-10-24' },
      { customerRef: 'CLT-2024-002', nom: 'Trabelsi', prenom: 'Amira', email: 'amira.trabelsi@email.tn', telephone: '+216 98 765 432', adresse: 'Rue de la R\u00e9publique, 42', ville: 'Sfax', codePostal: '3000', type: 'RESIDENTIAL', status: 'ACTIVE', accountBalance: 0, creditLimit: 150, createdAt: '2024-10-23' },
      { customerRef: 'CLT-2024-003', nom: 'Digital Solutions SARL', prenom: '', email: 'contact@digitalsol.tn', telephone: '+216 71 456 789', adresse: 'Zone Industrielle, Lot 8', ville: 'Sousse', codePostal: '4000', type: 'BUSINESS', status: 'ACTIVE', accountBalance: 1250.00, creditLimit: 5000, createdAt: '2024-10-23' },
      { customerRef: 'CLT-2024-004', nom: 'Gharbi', prenom: 'Youssef', email: 'youssef.gharbi@email.tn', telephone: '+216 55 111 222', adresse: 'Cit\u00e9 El Khadra, Bloc 3', ville: 'Tunis', codePostal: '1003', type: 'RESIDENTIAL', status: 'SUSPENDED', accountBalance: 89.90, creditLimit: 200, createdAt: '2024-09-15' },
      { customerRef: 'CLT-2024-005', nom: 'TechnoServ SA', prenom: '', email: 'admin@technoserv.tn', telephone: '+216 71 888 999', adresse: 'Centre Urbain Nord, Tour A', ville: 'Tunis', codePostal: '1082', type: 'BUSINESS', status: 'ACTIVE', accountBalance: 3420.00, creditLimit: 10000, createdAt: '2024-08-10' },
      { customerRef: 'CLT-2024-006', nom: 'Mansouri', prenom: 'Fatma', email: 'fatma.mansouri@email.tn', telephone: '+216 22 333 444', adresse: 'Rue Ibn Khaldoun, 7', ville: 'Monastir', codePostal: '5000', type: 'RESIDENTIAL', status: 'ACTIVE', accountBalance: 12.30, creditLimit: 150, createdAt: '2024-11-02' },
    ];
  }
}
