import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth/auth.service';
import { CommonModule } from '@angular/common';
import { AlertToastService } from '../../core/services/component/alert-toast.service';
import { AuthorizationError } from '../../models/errors/authorizationError';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageService } from '../../core/services/language.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [ LanguageService]
})
export class LoginComponent implements OnInit {

  loginForm!: FormGroup;  // FormGroup para manejar el formulario reactivo

  constructor(
    @Inject(Router) private router: Router,
    private authService: AuthService,
    @Inject(AlertToastService) private alertToastService: AlertToastService,
    private fb: FormBuilder ,  // FormBuilder para crear el formulario
    public translate: TranslateService,  // Servicio de traducción
  ) { translate.setDefaultLang('en'); }

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigateByUrl('/welcom');
    }
    this.initForm();  // Inicializamos el formulario
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  login(): void {
    if (this.loginForm.valid) {
      const loginDto = this.loginForm.value;
      this.authService.login(loginDto).subscribe(
        (res) => {
          loginDto.password = btoa(loginDto.password);
          this.authService.guardarToken(res.jwt);
          this.router.navigateByUrl('/dashboard');
          this.alertToastService.showToast('success', 'Logged in successfully', 1500);
        },
        (err: HttpErrorResponse) => {
          const serverError = err.error as AuthorizationError;
          const errorMessage = serverError.message || 'An error occurred during login';
          this.alertToastService.showToast('error', errorMessage, 3000);
        }
      );
    }
  }
}
