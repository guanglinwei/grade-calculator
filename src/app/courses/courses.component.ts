import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Course } from '../../models/course';
import { CoursesService } from './courses.service';

@Component({
  selector: 'app-courses',
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})

// TODO: check no repeated names OR use index for routing
export class CoursesComponent implements OnInit {
  @ViewChild('deleteConfirmModal') deleteConfirmModal!: ElementRef;

  courses: Course[] = [];
  toDelete?: string;
  toDeleteIndex?: number;
  deleteModalClassList!: DOMTokenList;

  constructor(private coursesService: CoursesService, private router: Router) { 

  }

  ngOnInit(): void {
    this.courses = this.coursesService.getCourses();
  }

  ngAfterViewInit(): void {
    this.deleteModalClassList = this.deleteConfirmModal.nativeElement.classList;
  }

  redirectToDetail(id: number): void {
    this.router.navigate(["/courses", id]);
  }

  addCourse(): void {
    this.courses.push(new Course("new course", []));
  }

  setCourseName(event: Event, index: number): void {
    let c = this.courses[index];
    if(c) c.name = (event.target as HTMLInputElement).value;
  }

  deleteModalSetVisible(visible: boolean): void {
    if(visible && !this.deleteModalClassList.contains("visible")) this.deleteModalClassList.add("visible");
    if(!visible && this.deleteModalClassList.contains("visible")) this.deleteModalClassList.remove("visible");
    this.deleteConfirmModal.nativeElement.attributes["aria-hidden"].value = !visible;
  }

  deleteCourse(i: number): void {
    this.toDelete = this.courses[i].name;
    this.toDeleteIndex = i;
    this.deleteModalSetVisible(true);
  }

  dismissModalNo(): void {
    this.toDelete = undefined;
    this.toDeleteIndex = undefined;
    this.deleteModalSetVisible(false);
  }

  dismissModalYes(): void {
    this.toDelete = undefined;
    this.deleteModalSetVisible(false);
    if(this.toDeleteIndex !== undefined) {
      if(this.courses.length === 0) this.courses = [];
      else this.courses.splice(this.toDeleteIndex, 1);
    }
    this.toDeleteIndex = undefined;
  }

}
