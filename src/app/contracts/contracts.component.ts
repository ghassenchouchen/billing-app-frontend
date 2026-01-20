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
}



