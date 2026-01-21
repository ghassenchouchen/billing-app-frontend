import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BillService } from '../../shared/services/bill.service';

@Component({
  selector: 'app-customer-payments',
  templateUrl: './customer-payments.component.html',
  styleUrls: ['./customer-payments.component.css']
})
export class CustomerPaymentsComponent implements OnInit, OnDestroy {
  @Input() customerId: string | null = null;
  
  pendingBills: any[] = [];
  paymentHistory: any[] = [];
  selectedBills: Set<string> = new Set();
  totalAmount: number = 0;
  processingPayment: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(private billService: BillService) {}

  ngOnInit(): void {
    if (this.customerId) {
      this.loadPendingBills();
      this.loadPaymentHistory();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadPendingBills(): void {
    if (!this.customerId) return;
    
    this.billService.getBills()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        // Filter unpaid bills for this customer (ISSUED and OVERDUE)
        this.pendingBills = data.filter(b => 
          b.client_id === this.customerId && 
          (b.status === 'issued' || b.status === 'overdue')
        );
      });
  }

  loadPaymentHistory(): void {
    if (!this.customerId) return;
    
    // TODO: Create PaymentService to fetch customer payment history
    // For now, using mock data
    this.paymentHistory = [];
  }

  toggleBillSelection(billId: string, amount: number): void {
    if (this.selectedBills.has(billId)) {
      this.selectedBills.delete(billId);
      this.totalAmount -= amount;
    } else {
      this.selectedBills.add(billId);
      this.totalAmount += amount;
    }
  }

  selectAllBills(): void {
    this.selectedBills.clear();
    this.totalAmount = 0;
    this.pendingBills.forEach(bill => {
      this.selectedBills.add(bill.facture_id);
      this.totalAmount += bill.amount;
    });
  }

  clearSelection(): void {
    this.selectedBills.clear();
    this.totalAmount = 0;
  }

  processPayment(): void {
    if (this.selectedBills.size === 0 || this.totalAmount <= 0) {
      return;
    }

    this.processingPayment = true;
    
    // TODO: Implement actual payment processing
    // This would typically involve:
    // 1. Creating a payment request
    // 2. Redirecting to payment gateway
    // 3. Handling payment confirmation

    console.log('Processing payment for bills:', Array.from(this.selectedBills));
    console.log('Total amount:', this.totalAmount);

    // Simulate payment processing
    setTimeout(() => {
      this.processingPayment = false;
      this.clearSelection();
      this.loadPendingBills();
      this.loadPaymentHistory();
      alert('Paiement traité avec succès!');
    }, 2000);
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'issued':
        return 'warning';
      case 'overdue':
        return 'danger';
      case 'paid':
        return 'success';
      case 'partially_paid':
        return 'info';
      default:
        return 'neutral';
    }
  }
}
