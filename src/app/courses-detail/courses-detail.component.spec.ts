import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Course } from 'src/models/course';
import { AppComponent } from '../app.component';
import { AssignmentComponent } from '../assignment/assignment.component';
import { CoursesService } from '../courses/courses.service';
import { ActivatedRouteStub } from '../shared/activated-route-stub';
import { PercentDisplayPipe } from '../shared/percent-display-pipe';
import { CoursesDetailComponent } from './courses-detail.component';

describe('CoursesDetailComponent', () => {
  let component: CoursesDetailComponent;
  let fixture: ComponentFixture<CoursesDetailComponent>;
  let routeStub: ActivatedRouteStub;
  let serviceStub: Partial<CoursesService>;
  let router: Router;

  beforeEach(async () => {
    serviceStub = {
      courses: [        
        new Course("Course 1", [{name: "a1", earnedPoints: 9, totalPoints: 10}, {name: "a2", earnedPoints: 8, totalPoints: 10}]),
        new Course("Course 2", []),
      ]   
    };

    routeStub = new ActivatedRouteStub({id: 0});


    await TestBed.configureTestingModule({
      declarations: [ CoursesDetailComponent, PercentDisplayPipe, AppComponent, AssignmentComponent ],
      providers: [ 
        {provide: CoursesService, useValue: serviceStub},
        {provide: ActivatedRoute, useValue: routeStub},
        {provide: Router, useValue: jasmine.createSpyObj('Router', ['navigate', 'navigateByUrl'])}
      ]
    })
    .compileComponents();

    router = TestBed.inject(Router);
  });
  beforeEach(() => {
    fixture = TestBed.createComponent(CoursesDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display correct course name', () => {
    fixture.detectChanges();
    expect(component.currentCourse.name).toBe("Course 1");
  });

  it('should calculate correct points to target score', () => {
    component.ptsToTarget = component.calculatePtsToTarget(90, 0);
    component.ptsToTargetGivenRemaining = component.calculatePtsToTargetGivenRemaining(90, 80);
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.querySelector('#pts-to-target').textContent).toBeCloseTo(10);
    expect(fixture.debugElement.nativeElement.querySelector('#pts-to-target-given-remaining').textContent).toBeCloseTo(73);
  });

  it('should maintain correct points after adding or deleting assignment', () => {
    component.currentCourse.removeAssignment(0);
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.querySelector(".summaryFraction").textContent).toBe("8 / 10");
    expect(fixture.debugElement.nativeElement.querySelector(".summaryScore").textContent).toBeCloseTo(80);

    component.currentCourse.addAssignment({name: "a3", earnedPoints: 19, totalPoints: 20});
    fixture.detectChanges();
    expect(fixture.debugElement.nativeElement.querySelector(".summaryFraction").textContent).toBe("27 / 30");
    expect(fixture.debugElement.nativeElement.querySelector(".summaryScore").textContent).toBeCloseTo(90);
  });

  it('should redirect to 404 on invalid id', () => {
    routeStub.setParamMap({id: 999});
    component.ngOnInit();
    fixture.detectChanges();
    expect((router.navigateByUrl as jasmine.Spy).calls.first().args[0]).toContain("404");
  });
});
