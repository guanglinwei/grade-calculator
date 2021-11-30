import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CoursesDetailComponent } from './courses-detail/courses-detail.component';
import { CoursesComponent } from './courses/courses.component';
import { NotFoundComponent } from './notfound/notfound.component';

const routes: Routes = [
  { path: '', redirectTo: '/courses', pathMatch: 'full' },
  { path: 'courses', component: CoursesComponent },
  { path: 'courses/:id', component: CoursesDetailComponent },
  { path: 'error/404', component: NotFoundComponent },
  { path: '**', redirectTo: 'error/404' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
