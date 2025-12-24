import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { ReportFormComponent } from './components/report-form/report-form.component';
import { ReportEditComponent } from './components/report-edit/report-edit.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'create', component: ReportFormComponent },
  { path: 'edit/:id', component: ReportEditComponent }
];