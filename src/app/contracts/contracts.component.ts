import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ContractService } from '../shared/services/contract.service';
import { Contract } from '../core/models';

@Component({
  selector: 'app-contracts',
  templateUrl: './contracts.component.html',
  styleUrls: ['./contracts.component.css']
})
export class ContractsComponent implements OnInit, OnDestroy {
  listofContracts: Contract[] = [];
  contractdetails: Contract | null = null;
  deactivatingId: string | null = null;
  showConfirmModal = false;
  confirmModalConfig = {
    title: '',
    message: '',
    action: null as (() => void) | null
  };
  private destroy$ = new Subject<void>();

  constructor(private contractService: ContractService) {}

  ngOnInit(): void {
    this.contractService.getContracts()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.listofContracts = data;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  detail(id: string): void {
    this.contractService.getContractDetails(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.contractdetails = data;
      });
  }

  deactivate(id: any): void {
    this.confirmModalConfig = {
      title: 'Suspendre le contrat',
      message: 'Êtes-vous sûr de vouloir suspendre ce contrat ? Cette action peut avoir des conséquences sur la facturation.',
      action: () => this.confirmDeactivate(String(id))
    };
    this.showConfirmModal = true;
  }

  confirmDeactivate(id: string): void {
    this.showConfirmModal = false;
    this.deactivatingId = id;
    this.contractService.suspendContract(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.patchContract(data);
        if (this.contractdetails && String(this.contractdetails.id) === id) {
          this.contractdetails = data;
        }
        this.deactivatingId = null;
      });
  }

  cancelConfirm(): void {
    this.showConfirmModal = false;
  }

  private patchContract(updated: Contract): void {
    const index = this.listofContracts.findIndex(c => c.id === updated.id);
    if (index >= 0) {
      this.listofContracts = this.listofContracts.map((contract, idx) => idx === index ? { ...contract, ...updated } : contract);
    }
  }
}



