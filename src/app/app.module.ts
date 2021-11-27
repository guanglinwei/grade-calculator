import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
// import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoursesComponent } from './courses/courses.component';
import { CoursesDetailComponent } from './courses-detail/courses-detail.component';
import { AssignmentComponent } from './assignment/assignment.component';
import { CoursesService } from './courses/courses.service';
import { PercentDisplayPipe } from './shared/percent-display-pipe';


@NgModule({
  declarations: [
    AppComponent,
    CoursesComponent,
    CoursesDetailComponent,
    AssignmentComponent,
    PercentDisplayPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [{
    provide: APP_INITIALIZER,
    useFactory: (s: CoursesService) => () => s.importDataFromJson(),
    deps: [CoursesService],
    multi: true,
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
