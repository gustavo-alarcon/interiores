import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterDocumentsComponent } from './register-documents.component';

const routes: Routes = [
  {
    path: '',
    component: RegisterDocumentsComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RegisterDocumentsRoutingModule { }
