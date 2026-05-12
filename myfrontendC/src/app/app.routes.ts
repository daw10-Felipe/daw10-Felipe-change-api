import { Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';
import { adminGuard } from './auth/admin.guard';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { ProfileComponent } from './pages/profile/profile';
import { HomeComponent } from './pages/home/home';
import { PetitionDetailComponent } from './pages/petitions/detail/petition-detail';
import { CreateComponent } from './pages/petitions/create-component/create-component';
import { EditComponent } from './pages/petitions/edit-component/edit-component';
import { AdminLayoutComponent } from './pages/admin/admin-layout';
import { AdminDashboardComponent } from './pages/admin/dashboard/dashboard';
import { AdminUsersComponent } from './pages/admin/users/users';
import { AdminPetitionsComponent } from './pages/admin/petitions/petitions';
import { AdminCategoriesComponent } from './pages/admin/categories/categories';
import { MisFirmasComponent } from './pages/mis-firmas/mis-firmas';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard],
  },
  {
    path: 'mis-firmas',
    component: MisFirmasComponent,
    canActivate: [authGuard]
  },

  { path: 'petitions', component: HomeComponent },
  {
    path: 'petitions/create',
    component: CreateComponent,
    canActivate: [authGuard]
  },
  {
    path: 'petitions/:id/edit',
    component: EditComponent,
    canActivate: [authGuard]
  },
  { path: 'petitions/:id', component: PetitionDetailComponent },

  
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [adminGuard],
    children: [
      { path: '', component: AdminDashboardComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'petitions', component: AdminPetitionsComponent },
      { path: 'categories', component: AdminCategoriesComponent },
    ]
  },

  { path: '**', redirectTo: '' }
];
