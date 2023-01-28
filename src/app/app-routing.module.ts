import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { EditorPageComponent } from './pages/editor/editor-page.component';

const routes: Routes = [
  { path: 'editor', component: EditorPageComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
