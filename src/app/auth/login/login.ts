import { Component, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../shared/services/supabase-service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [CommonModule , ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private toastr = inject(ToastrService);
  private supabaseService = inject(SupabaseService);
  private router = inject(Router);

  loginForm!: FormGroup;

  isLoading: boolean = false;
  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  async ngOnInit() {
    const session = await this.supabaseService.getSession();
    if (!session)return
    else{
      this.router.navigate(['/admin'])
    };
  }

  async onSubmit() {
    if (this.loginForm.invalid) {
      this.toastr.error('Please enter a valid email and password');
      return;
    }
    try {
      this.isLoading = true;
      const email = this.loginForm.value.email as string;
      const password = this.loginForm.value.password as string;

      const { authData, authError } = await this.supabaseService.signInWithEmail(email, password);
      if (authError) throw authError;
      this.toastr.success('Login Successful!');
      await this.supabaseService.getSession();
      this.router.navigate(['/admin'])
    } catch (error) {
      if (error instanceof Error) {
        console.log(error.message);
        this.toastr.error('Invalid Login Credentials');
      }
    } finally {
      this.isLoading = false;
      this.loginForm.reset();
    }
  }
}
