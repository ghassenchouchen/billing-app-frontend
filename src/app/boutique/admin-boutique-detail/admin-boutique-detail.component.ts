import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import {
  BoutiqueApiService,
  Boutique,
  DashboardData,
  StockSim,
  TransactionBoutique
} from '../../core/services/boutique-api.service';
import { UserService, UserDto } from '../../core/services/user.service';
import { CustomerService } from '../../shared/services/customer.service';
import { AbonnementService } from '../../shared/services/abonnement.service';
import { Customer, Abonnement } from '../../core/models';
import { filterList } from '../../shared/utils/list-filter.util';

type TabName = 'dashboard' | 'stock' | 'transactions' | 'team' | 'customers' | 'subscriptions';

@Component({
  selector: 'app-admin-boutique-detail',
  templateUrl: './admin-boutique-detail.component.html',
  styleUrls: ['./admin-boutique-detail.component.css']
})
export class AdminBoutiqueDetailComponent implements OnInit, OnDestroy {

  // ── Core State ──
  boutiqueId!: number;
  boutique: Boutique | null = null;
  activeTab: TabName = 'dashboard';
  loading = true;
  forbidden = false;

  // ── Tab Data ──
  dashboard: DashboardData | null = null;
  stock: StockSim[] = [];
  transactions: TransactionBoutique[] = [];
  team: UserDto[] = [];
  customers: Customer[] = [];
  subscriptions: Abonnement[] = [];

  // ── Filtered Views ──
  filteredStock: StockSim[] = [];
  filteredTransactions: TransactionBoutique[] = [];
  filteredCustomers: Customer[] = [];
  filteredSubscriptions: Abonnement[] = [];

  // ── Filter Controls ──
  stockSearch = '';
  stockStatusFilter = '';
  txnSearch = '';
  txnStatusFilter = '';
  customerSearch = '';
  customerStatusFilter = '';
  subSearch = '';
  subStatusFilter = '';

  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private boutiqueApi: BoutiqueApiService,
    private userService: UserService,
    private customerService: CustomerService,
    private abonnementService: AbonnementService
  ) {}

  // ── Lifecycle ──

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.boutiqueId = idParam ? parseInt(idParam, 10) : 0;

    if (!this.authService.isAdmin()) {
      const userBoutiqueId = this.authService.getBoutiqueId();
      if (!userBoutiqueId || parseInt(userBoutiqueId, 10) !== this.boutiqueId) {
        this.forbidden = true;
        this.loading = false;
        return;
      }
    }

    this.loadBoutique();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Tab Management ──

  switchTab(tab: TabName): void {
    this.activeTab = tab;
    this.loadTabData();
  }

  // ── Data Loading ──

  loadBoutique(): void {
    this.loading = true;
    this.boutiqueApi.getById(this.boutiqueId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (b) => {
          this.boutique = b;
          this.loading = false;
          this.loadTabData();
        },
        error: () => { this.loading = false; }
      });
  }

  private loadTabData(): void {
    const loaders: Record<TabName, () => void> = {
      dashboard: () => this.loadDashboard(),
      stock: () => this.loadStock(),
      transactions: () => this.loadTransactions(),
      team: () => this.loadTeam(),
      customers: () => this.loadCustomers(),
      subscriptions: () => this.loadSubscriptions(),
    };
    loaders[this.activeTab]();
  }

  private loadDashboard(): void {
    if (this.dashboard) return;
    this.boutiqueApi.getDashboard(this.boutiqueId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (d) => this.dashboard = d,
        error: () => {
          this.dashboard = {
            revenueToday: 0, contractsThisMonth: 0, contractTarget: 10,
            simAvailable: 0, simLowStock: 0, simByType: {}
          };
        }
      });
  }

  private loadStock(): void {
    if (this.stock.length) { this.applyStockFilters(); return; }
    this.boutiqueApi.getStock(this.boutiqueId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (s) => { this.stock = s; this.applyStockFilters(); },
        error: () => { this.stock = []; this.filteredStock = []; }
      });
  }

  private loadTransactions(): void {
    if (this.transactions.length) { this.applyTxnFilters(); return; }
    this.boutiqueApi.getTransactions(this.boutiqueId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (t) => { this.transactions = t; this.applyTxnFilters(); },
        error: () => { this.transactions = []; this.filteredTransactions = []; }
      });
  }

  private loadTeam(): void {
    if (this.team.length) return;
    this.userService.getTeamByBoutique(this.boutiqueId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (users) => { this.team = users; },
        error: () => { this.team = []; }
      });
  }

  private loadCustomers(): void {
    if (this.customers.length) { this.applyCustomerFilters(); return; }
    if (!this.boutique) return;
    this.customerService.getCustomersByBoutique(this.boutique.code)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (c) => { this.customers = c; this.applyCustomerFilters(); },
        error: () => { this.customers = []; this.filteredCustomers = []; }
      });
  }

  private loadSubscriptions(): void {
    if (this.subscriptions.length) { this.applySubFilters(); return; }
    // TODO: Replace N+1 fan-out with a single backend endpoint
    // GET /api/subscriptions?boutiqueRef=... to eliminate per-customer fetching.
    if (!this.customers.length && this.boutique) {
      this.customerService.getCustomersByBoutique(this.boutique.code)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (customers) => {
            this.customers = customers;
            this.fetchSubscriptionsForCustomers(customers);
          },
          error: () => { this.subscriptions = []; this.filteredSubscriptions = []; }
        });
    } else {
      this.fetchSubscriptionsForCustomers(this.customers);
    }
  }

  private fetchSubscriptionsForCustomers(customers: Customer[]): void {
    if (!customers.length) {
      this.subscriptions = [];
      this.filteredSubscriptions = [];
      return;
    }
    const allSubs: Abonnement[] = [];
    let pending = customers.length;

    customers.forEach(c => {
      this.abonnementService.getAbonnementsByCustomer(c.customerRef)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (subs) => {
            subs.forEach(s => { s.clientRef = c.customerRef; });
            allSubs.push(...subs);
            if (--pending === 0) { this.subscriptions = allSubs; this.applySubFilters(); }
          },
          error: () => {
            if (--pending === 0) { this.subscriptions = allSubs; this.applySubFilters(); }
          }
        });
    });
  }

  // ── Filters (using generic filterList utility) ──

  applyStockFilters(): void {
    this.filteredStock = filterList(this.stock, {
      search: this.stockSearch,
      searchFields: ['iccid', 'msisdn'],
      statusField: 'status',
      statusValue: this.stockStatusFilter,
    });
  }

  applyTxnFilters(): void {
    this.filteredTransactions = filterList(this.transactions, {
      search: this.txnSearch,
      searchFields: ['clientNom', 'reference', 'offreLibelle'],
      statusField: 'status',
      statusValue: this.txnStatusFilter,
    });
  }

  applyCustomerFilters(): void {
    this.filteredCustomers = filterList(this.customers, {
      search: this.customerSearch,
      searchFields: ['nom', 'prenom', 'email', 'customerRef', 'telephone'],
      statusField: 'status',
      statusValue: this.customerStatusFilter,
    });
  }

  applySubFilters(): void {
    this.filteredSubscriptions = filterList(this.subscriptions, {
      search: this.subSearch,
      searchFields: ['clientRef'],
      statusField: 'status',
      statusValue: this.subStatusFilter,
    });
  }

  // ── Navigation ──

  goBack(): void { this.router.navigate(['/Boutiques']); }
  viewCustomers(): void { this.switchTab('customers'); }
  viewCustomerDetail(ref: string): void { this.router.navigate(['/Customers', ref]); }
  viewSubscriptionDetail(id: number): void { this.router.navigate(['/Abonnements', id]); }

  // ── Template Helpers (only non-pipe logic remains) ──

  get availableSimCount(): number {
    return this.stock.filter(s => s.status === 'AVAILABLE').length;
  }

  getCustomerTypeIcon(type: string): string {
    const upper = (type || '').toUpperCase();
    return upper === 'BUSINESS' || upper === 'B2B' ? 'business' : 'person';
  }

  getSimTypeLabel(type: string): string {
    return type === 'ESIM' ? 'eSIM' : type === 'STANDARD' ? 'Standard' : type;
  }
}
