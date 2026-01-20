import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Offer } from '../core/models';
import { OffersService } from '../shared/services/offers.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.css']
})
export class OffersComponent implements OnInit, OnDestroy {
  listofoffers: Offer[] = [];
  offersdetails: Offer | null = null;
  private destroy$ = new Subject<void>();

  constructor(private offersService: OffersService) {}

  ngOnInit(): void {
    this.offersService.getOffers()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.listofoffers = data;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  detail(id: string): void {
    this.offersService.getOfferDetails(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.offersdetails = data;
      });
  }
}
