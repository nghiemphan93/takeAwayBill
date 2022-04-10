import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UpdateRefreshTokenComponent } from './update-refresh-token/update-refresh-token.component';

const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'update-token', component: UpdateRefreshTokenComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthRoutingModule {}
