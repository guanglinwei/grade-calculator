import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { DragDropModule } from '@angular/cdk/drag-drop';
// import { FormsModule } from '@angular/forms';
// import { RouterModule, Routes } from '@angular/router';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CoursesComponent } from './courses/courses.component';
import { CoursesDetailComponent } from './courses-detail/courses-detail.component';
import { AssignmentComponent } from './assignment/assignment.component';
import { CoursesService } from './courses/courses.service';
import { PercentDisplayPipe } from './shared/percent-display-pipe';
import { NotFoundComponent } from './notfound/notfound.component';


@NgModule({
  declarations: [
    AppComponent,
    CoursesComponent,
    CoursesDetailComponent,
    AssignmentComponent,
    PercentDisplayPipe,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    DragDropModule
  ],
  providers: [{
    provide: APP_INITIALIZER,
    useFactory: (s: CoursesService) => () => {
      s.importDataFromJson(localStorage.getItem('gradeData') || '{"courses":[]}'); //.then(null, rej => console.log(rej));
    },
    deps: [CoursesService],
    multi: true,
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
