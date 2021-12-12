import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Course } from '../../models/course';
import { CoursesService } from '../courses/courses.service';

@Component({
  selector: 'app-courses-detail',
  templateUrl: './courses-detail.component.html',
  styleUrls: ['./courses-detail.component.scss']
})
export class CoursesDetailComponent implements OnInit {
  currentCourse!: Course;

  ptsToTarget: string = "0";
  toTargetScore: number = 93;
  toTargetMissing: number = 0;

  ptsToTargetGivenRemaining: string = "0";
  toTargetGivenScore: number = 93;
  toTargetGivenRemaining: number = 100;

  private numOnly: RegExp = /^[0-9]*(.[0-9]+)?$/;

  constructor(
    private route: ActivatedRoute,
    private service: CoursesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    let id = 0;
    if(rawId === null) {
      this.router.navigateByUrl("/error/404");
      return;
    }
    else id = parseInt(rawId);

    const c = this.service.courses[id];
    if(id >= this.service.courses.length || c === undefined) {
      this.router.navigateByUrl("/error/404"); // throw new Error("Course of id " + rawId + " not found");
      return;
    }

    this.currentCourse = c;
    this.service.currentCourse = c;
    this.ptsToTarget = this.calculatePtsToTarget(93, 0);
    this.ptsToTargetGivenRemaining = this.calculatePtsToTargetGivenRemaining(93, 100);
  }

  calculatePtsToTarget(target: number, loss: number = 0): string {
    const course = this.currentCourse;
    if(target > 1) target /= 100;
    const ans = ((course.points - target * (course.totalPoints + loss)) / (target - 1 + Number.EPSILON));
    return ans < 0 ? "0" : ans.toFixed(2).toString();
  }

  calculatePtsToTargetGivenRemaining(target: number, remaining: number): string {
    const course = this.currentCourse;
    if(target > 1) target /= 100;
    const ans = (target * (course.totalPoints + remaining)) - course.points;
    return ans > remaining ? "Impossible" : ans.toFixed(2).toString();
  }

  updateSummaryValues(event: Event) {
    const element = event.target as HTMLInputElement;
    const value = element.value.trim();
    switch(element.id) {
      case "to-target-score":
        if(this.numOnly.exec(value)) this.toTargetScore = parseFloat(value);
        break;

      case "to-target-missing":
        if(this.numOnly.exec(value)) this.toTargetMissing = parseFloat(value);
        break;

      case "to-target-given-score":
        if(this.numOnly.exec(value)) this.toTargetGivenScore = parseFloat(value);
        break;

      case "to-target-given-remaining":
        if(this.numOnly.exec(value)) this.toTargetGivenRemaining = parseFloat(value);
        break;

      default:
        return;
    }

    this.ptsToTarget = this.calculatePtsToTarget(this.toTargetScore || 93, this.toTargetMissing || 0);
    this.ptsToTargetGivenRemaining = this.calculatePtsToTargetGivenRemaining(this.toTargetGivenScore || 93, this.toTargetGivenRemaining || 100);
  }

  updateSummary(event: Event): void {
    this.ptsToTarget = this.calculatePtsToTarget(this.toTargetScore || 93, this.toTargetMissing || 0);
    this.ptsToTargetGivenRemaining = this.calculatePtsToTargetGivenRemaining(this.toTargetGivenScore || 93, this.toTargetGivenRemaining || 100);
  }

  createAssignment(name: string = "", earnedPoints: number = 0, totalPoints: number = 0): void {
    this.currentCourse.addAssignment({
      name: name,
      earnedPoints: earnedPoints,
      totalPoints: totalPoints
    });
  }
}
