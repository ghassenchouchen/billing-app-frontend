import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';
import { BoutiqueApiService, StockSim } from '../../core/services/boutique-api.service';

interface StockItem {
  iccid: string;
  imsi: string;
  msisdn: string;
  simType: string;
}

interface ProductType {
  key: string;
  label: string;
  icon: string;
  description: string;
  enabled: boolean;
}

@Component({
  selector: 'app-add-stock',
  templateUrl: './add-stock.component.html',
  styleUrls: ['./add-stock.component.css']
})
export class AddStockComponent implements OnInit, OnDestroy {
  boutiqueId = 1;

  productTypes: ProductType[] = [
    { key: 'SIM', label: 'Cartes SIM', icon: 'sim_card', description: 'SIM physiques et eSIM', enabled: true },
    { key: 'DEVICE', label: 'Terminaux', icon: 'smartphone', description: 'Téléphones et tablettes', enabled: false },
    { key: 'ACCESSORY', label: 'Accessoires', icon: 'headset', description: 'Coques, chargeurs, etc.', enabled: false },
  ];
  selectedProductType = 'SIM';

  newSimData: StockItem = { iccid: '', imsi: '', msisdn: '', simType: 'STANDARD' };
  batch: StockItem[] = [];
  saving = false;
  saveSuccess = false;
  saveError = '';

  totalStock = 0;
  availableStock = 0;
  stockByType: { [key: string]: number } = {};

  loadingStats = true;
  private destroy$ = new Subject<void>();

  constructor(
    private boutiqueApi: BoutiqueApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const storedId = this.authService.getBoutiqueId();
    this.boutiqueId = storedId ? parseInt(storedId, 10) : 1;
    this.loadStockStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadStockStats(): void {
    this.loadingStats = true;
    this.boutiqueApi.getStock(this.boutiqueId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (stock) => {
          this.totalStock = stock.length;
          this.availableStock = stock.filter(s => s.status === 'AVAILABLE').length;
          this.stockByType = {};
          stock.forEach(s => {
            const key = s.simType || 'OTHER';
            this.stockByType[key] = (this.stockByType[key] || 0) + 1;
          });
          this.loadingStats = false;
        },
        error: () => {
          this.loadingStats = false;
        }
      });
  }

  selectProductType(key: string): void {
    const pt = this.productTypes.find(p => p.key === key);
    if (pt && pt.enabled) {
      this.selectedProductType = key;
      this.batch = [];
    }
  }

  generateSimData(): void {
    const ts = Date.now().toString();
    const rand = Math.floor(Math.random() * 900000000) + 100000000;
    this.newSimData.iccid = '892160' + ts.slice(-10) + rand.toString().slice(0, 6);
    this.newSimData.imsi = '60501' + rand.toString().slice(0, 10);
    this.newSimData.msisdn = '+2162' + rand.toString().slice(0, 8);
  }

  get canAddToList(): boolean {
    return !!(this.newSimData.iccid && this.newSimData.msisdn);
  }

  get isDuplicate(): boolean {
    return this.batch.some(s => s.iccid === this.newSimData.iccid);
  }

  addToList(): void {
    if (!this.canAddToList || this.isDuplicate) return;
    this.batch.push({ ...this.newSimData });
    this.newSimData = { iccid: '', imsi: '', msisdn: '', simType: this.newSimData.simType };
    this.saveSuccess = false;
    this.saveError = '';
  }

  removeFromList(index: number): void {
    this.batch.splice(index, 1);
  }

  clearBatch(): void {
    this.batch = [];
  }

  generateBatch(count: number): void {
    const simType = this.newSimData.simType;
    for (let i = 0; i < count; i++) {
      const ts = Date.now().toString();
      const rand = Math.floor(Math.random() * 900000000) + 100000000;
      this.batch.push({
        iccid: '892160' + ts.slice(-10) + rand.toString().slice(0, 6),
        imsi: '60501' + rand.toString().slice(0, 10),
        msisdn: '+2162' + rand.toString().slice(0, 8),
        simType
      });
    }
  }

  save(): void {
    if (this.batch.length === 0 || this.saving) return;

    this.saving = true;
    this.saveSuccess = false;
    this.saveError = '';

    this.boutiqueApi.addSimBatch(this.boutiqueId, this.batch)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.saving = false;
          this.saveSuccess = true;
          this.batch = [];
          this.loadStockStats();
        },
        error: (err) => {
          this.saving = false;
          this.saveError = err?.error?.message || 'Erreur lors de l\'enregistrement du stock.';
        }
      });
  }

  goBack(): void {
    this.router.navigate(['/Boutique/stock']);
  }

  formatIccid(iccid: string): string {
    if (iccid.length > 12) {
      return iccid.slice(0, 6) + '…' + iccid.slice(-6);
    }
    return iccid;
  }
}
