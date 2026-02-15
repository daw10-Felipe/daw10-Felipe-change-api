import { Routes } from '@angular/router';
import { authGuard } from './auth/auth-guard';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { ProfileComponent } from './pages/profile/profile';
import { HomeComponent } from './pages/home/home';
import { PetitionDetailComponent } from './pages/petitions/detail/petition-detail';
import { CreateComponent } from './pages/petitions/create-component/create-component';
import { EditComponent } from './pages/petitions/edit-component/edit-component';
export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [authGuard], //portero
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

  { path: '**', redirectTo: '' }
];
