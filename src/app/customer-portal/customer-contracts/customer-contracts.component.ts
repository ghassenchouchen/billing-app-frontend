import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ContractService } from '../../shared/services/contract.service';
import { Contract } from '../../core/models';

@Component({
  selector: 'app-customer-contracts',
  templateUrl: './customer-contracts.component.html',
  styleUrls: ['./customer-contracts.component.css']
})
export class CustomerContractsComponent implements OnInit, OnDestroy {
  @Input() customerId: string | null = null;
  
  listofContracts: Contract[] = [];
  contractdetails: Contract | null = null;
  cancellationRequestingId: string | null = null;
  cancellationReason: string = '';
  showCancellationForm: boolean = false;
  selectedContractForCancellation: Contract | null = null;
  private destroy$ = new Subject<void>();

  constructor(private contractService: ContractService) {}

  ngOnInit(): void {
    if (this.customerId) {
      this.loadContracts();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadContracts(): void {
    if (!this.customerId) return;
    
    this.contractService.getContractsByCustomer(this.customerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.listofContracts = data;
      });
  }

  detail(id: string): void {
    this.contractService.getContractDetails(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        // Only show if it's the customer's contract
        if (data.customer_id === this.customerId) {
          this.contractdetails = data;
        }
      });
  }

  requestCancellation(contract: Contract): void {
    this.selectedContractForCancellation = contract;
    this.showCancellationForm = true;
  }

  submitCancellationRequest(): void {
    if (!this.selectedContractForCancellation || !this.cancellationReason.trim()) {
      return;
    }

    this.cancellationRequestingId = this.selectedContractForCancellation.contract_id;
    this.contractService.requestCancellation(this.selectedContractForCancellation.contract_id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        // Update the contract status
        const index = this.listofContracts.findIndex(c => c.contract_id === data.contract_id);
        if (index >= 0) {
          this.listofContracts = this.listofContracts.map((contract, idx) => 
            idx === index ? { ...contract, ...data } : contract
          );
        }
        if (this.contractdetails && this.contractdetails.contract_id === data.contract_id) {
          this.contractdetails = data;
        }
        this.closeCancellationForm();
        this.cancellationRequestingId = null;
      });
  }

  closeCancellationForm(): void {
    this.showCancellationForm = false;
    this.cancellationReason = '';
    this.selectedContractForCancellation = null;
  }
}
