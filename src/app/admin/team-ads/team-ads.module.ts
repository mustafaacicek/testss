import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeamAdsListComponent } from './team-ads-list/team-ads-list.component';
import { TeamAdFormComponent } from './team-ad-form/team-ad-form.component';
import { TeamAdsService } from './team-ads.service';
import { AuthGuard } from '../../services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: TeamAdsListComponent,
    canActivate: [AuthGuard],
    data: { role: 'Admin' }
  },
  {
    path: 'create',
    component: TeamAdFormComponent,
    canActivate: [AuthGuard],
    data: { role: 'Admin' }
  },
  {
    path: 'edit/:id',
    component: TeamAdFormComponent,
    canActivate: [AuthGuard],
    data: { role: 'Admin' }
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes)
  ],
  providers: [TeamAdsService]
})
export class TeamAdsModule { }
