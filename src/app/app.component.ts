import { Component, HostListener } from '@angular/core';
import { CoursesService } from './courses/courses.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'grade-calculator';

  constructor(private coursesService: CoursesService) {}

  @HostListener('window:beforeunload', ['$event'])
  beforeUnloadHandler(event: Event) {
    this.coursesService.exportDataAsJson();
  }
}
