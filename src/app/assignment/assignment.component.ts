import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Assignment } from 'src/models/assignment';
import { Course } from 'src/models/course';
import { CoursesService } from '../courses/courses.service';

@Component({
  selector: '[app-assignment]',
  templateUrl: './assignment.component.html',
  styleUrls: ['./assignment.component.scss']
})
export class AssignmentComponent implements OnInit {
  @Input() assignment!: Assignment;
  @Input() index!: number;
  // updates ptsToTarget in courses-detail
  @Output() updateCoursesSummary = new EventEmitter();

  constructor(
    private service: CoursesService,
  ) {}

  ngOnInit(): void {
  }

  getCurrentCourse(): Course {
    return this.service.currentCourse!;
  }

  setAssignmentValue(event: Event, assignment: Assignment): void {
    const element = event.target as HTMLInputElement;
    const cList = element.classList;
    const keyToFunc: { [key: string]: () => void } = {
      "assignName": () => { assignment.name = element.value || "" },
      "assignFraction" : () => {
        // match number/number
        const match = /^\s*([0-9]*[.])?[0-9]+\s*\/\s*([0-9]*[.])?[0-9]+\s*$/.exec(element.value);
        if(match) {
          const vals = match[0].trim().split("/");
          assignment.earnedPoints = parseFloat(vals[0]) || 0;
          assignment.totalPoints = parseFloat(vals[1]) || 0;
          element.className = element.className.replace("is-invalid", "").trim();
        }
        else if(!cList.contains("is-invalid")) element.className = element.className.trim() + " is-invalid"; 
      },
    };
    cList.forEach(v => {
      if (Object.prototype.hasOwnProperty.call(keyToFunc, v)) {
        keyToFunc[v]();
      }
    });

    this.service.currentCourse?.recalculateValues();
    this.updateCoursesSummary.emit();
  }
  
  deleteAssignment(i: number) {
    if(this.service.currentCourse) {
      this.service.currentCourse.removeAssignment(i);
      this.updateCoursesSummary.emit();
    }
  }
}
