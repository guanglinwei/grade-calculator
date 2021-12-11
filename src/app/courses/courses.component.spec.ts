import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Course } from 'src/models/course';

import { CoursesComponent } from './courses.component';
import { CoursesService } from './courses.service';

describe('CoursesComponent', () => {
  let component: CoursesComponent;
  let fixture: ComponentFixture<CoursesComponent>;
  let serviceStub: Partial<CoursesService>;
  let router: Router;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const c = [        
      new Course("Course 1", [{name: "a1", earnedPoints: 9, totalPoints: 10}, {name: "a2", earnedPoints: 8, totalPoints: 10}]),
      new Course("Course 2", []),
    ];
    serviceStub = {
      courses: c,
      getCourses: () => {
        return c;
      },
    };

    await TestBed.configureTestingModule({
      declarations: [ CoursesComponent ],
      providers: [{ provide: CoursesService, useValue: serviceStub }, { provide: Router, useValue: routerSpy }]
    })
    .compileComponents();

    router = TestBed.inject(Router);
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoursesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  
  it('should redirect to valid course', () => {
    component.redirectToDetail(0);
    fixture.detectChanges();
    const spy = router.navigate as jasmine.Spy;
    expect(spy.calls.first().args[0]).withContext('correct url').toEqual(['/courses', 0]);
  });
});
