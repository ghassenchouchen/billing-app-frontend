import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Service } from '../core/models';
import { ServicesService } from '../shared/services/services.service';

@Component({
  selector: 'app-services',
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit, OnDestroy {
  listofServices: Service[] = [];
  servicedetails: Service | null = null;
  private destroy$ = new Subject<void>();

  constructor(private serviceService: ServicesService) {}

  ngOnInit(): void {
    this.serviceService.getServices()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.listofServices = data;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  detail(id: string): void {
    this.serviceService.getServiceDetails(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        this.servicedetails = data;
      });
  }
}
