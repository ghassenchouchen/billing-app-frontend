import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  notcorrect1: boolean = false;
  notcorrect2: boolean = false;
  loginError: string = '';
  errorMessage: string = '';
  returnUrl: string = '';
  isCustomerLogin: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get return url from route parameters or default to '/Customers' or '/Portal'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/Customers';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSubmit(form: NgForm): void {
    if (!form) {
      return;
    }

    if (form.invalid) {
      form.form.markAllAsTouched();
      this.errorMessage = 'Please provide both username and password.';
      return;
    }

    this.verify(form);
  }

  verify(f: NgForm): void {
    this.loginError = '';
    this.errorMessage = '';
    this.notcorrect1 = false;
    this.notcorrect2 = false;

    const username = (f.value.username || '').trim();
    const password = f.value.password || '';

    if (!username || !password) {
      this.errorMessage = 'Please provide both username and password.';
      return;
    }

    this.authService.login(username, password, this.isCustomerLogin)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.login) {
            const redirectUrl = this.isCustomerLogin ? '/Portal' : (this.returnUrl || '/Customers');
            this.router.navigate([redirectUrl]);
          } else {
            this.notcorrect1 = !response.userName;
            this.notcorrect2 = !response.password;
            this.loginError = 'Invalid username or password';
            this.errorMessage = 'Invalid username or password';
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.loginError = 'An error occurred during login. Please try again.';
          this.errorMessage = 'An error occurred during login. Please try again.';
        }
      });
  }
}
