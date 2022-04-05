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

describe('CoursesService', () => {
  let service: CoursesService;
  beforeEach(() => { service = new CoursesService(); });

  it('should import genesis grades properly html', () => {
    const h = `
    <html>
      <table class='list'>
        <tr class="listroweven"><td></td><td></td><td></td><td></td>
          <td>assign1   Comment from  
              </td>
          <td>         3 /           3 0%</td>
          <td>aaa</td>
        </tr>
        <tr class="listrowodd"><td></td><td></td><td></td><td></td>
          <td>assign2     
              comment from</td>
          <td>         4 /           5 0% </td>
          <td>aaa</td>
        </tr>
        <tr class="listroweven"><td></td><td></td><td></td><td></td>
          <td>assign3     
                    comment from</td>
          <td>         9 /          12 0%</td>
          <td>aaa</td>
        </tr>
        <tr class="listrowodd"><td></td><td></td><td></td><td></td>
          <td>assign4     
              comment from</td>
          <td>      Assignment pts: 100  Exempt </td>
          <td>aaa</td>
        </tr>
        <tr class="listroweven"><td></td><td></td><td></td><td></td>
          <td>assign5     
              comment from</td>
          <td>      Assignment pts: 5  Missing </td>
          <td>aaa</td>
        </tr>
      </table>
    </html>
    `;

    service.importCourseFromHTML('genesishtml', h);
    expect(service.courses[0].average).withContext("correct average").toBeCloseTo(64);
    expect(service.courses[0].getAssignmentList().map((v) => v.name).join('')).withContext("correct names").toBe("assign1assign2assign3assign4assign5");
    expect(service.courses[0].getAssignmentList().map(v => v.earnedPoints).join('')).withContext("correct earned points").toBe("34900");
    expect(service.courses[0].getAssignmentList().map(v => v.totalPoints).join('')).withContext("correct total points").toBe("351205");
  });

  it('should import genesis grades properly text', () => {
    const t = `WEEKLY SUMMARY LIST ASSIGNMENTS COURSE SUMMARY
    Course Summary for 
    COURSE
    Marking Period 2 Grade: 99.99%    Change Marking Period
    Assignments    Marking Period 2   
    MP	DUE	TEACHER	CATEGORY	ASSIGNMENT	GRADE Percentage is rounded to Hundredths Place	COMMENT	PREV	DOCS
    MP2	
    Tue
    5/3
    last, first	Projects	A	
    Assignment Pts: 50
    Exempt
    MP2	
    Mon
    3/28
    last, first	Homework	B	50 / 50
    100.00%
    MP2	
    Mon
    3/28
    last, first	Homework	C	25 / 50
    100.00%

    * Assignments graded as EX (Exempt) or ABS (Absent) do not impact a student's grade.
    * Assignments graded as M (Missing) counts as 0.0% and INC (Incomplete) counts as 0.0%.
    `

    service.importCourseFromHTML('genesis', t);
    expect(service.courses[0].average).withContext("correct average").toBeCloseTo(75);
    expect(service.courses[0].getAssignmentList().map((v) => v.name).join('')).withContext("correct names").toBe("ABC");
    expect(service.courses[0].getAssignmentList().map(v => v.earnedPoints).join('')).withContext("correct earned points").toBe("05025");
    expect(service.courses[0].getAssignmentList().map(v => v.totalPoints).join('')).withContext("correct total points").toBe("05050");
  });

  it('should display error when invalid html', () => {
    const h1 = `<html><div></div> </html>`;
    let res;
    service.importCourseFromHTML('genesishtml', h1, (e) => res = (e instanceof Error) ? e.message : e);
    expect(res).withContext("no table").toBeTruthy();

    const h2 = `a`;
    service.importCourseFromHTML('genesishtml', h2, (e) => res = (e instanceof Error) ? e.message : e);
    expect(res).withContext("not html").toBeTruthy();

    const h3 = `
    <html>
      <table class='list'>
        <tr class="listroweven"><td></td><td></td><td></td><td></td>
          <td>assign1   Comment from  
              </td>
          <td>         A 0%</td>
          <td>aaa</td>
        </tr>
        <tr class="listrowodd"><td></td><td></td><td></td><td></td>
          <td>assign2     
              comment from</td>
          <td>         4 /           5 0% </td>
          <td>aaa</td>
        </tr>
      </table>
    </html>
    `;
    service.importCourseFromHTML('genesishtml', h3, (e) => res = (e instanceof Error) ? e.message : e);
    expect(res).withContext("letter grades not supported").toContain("letter grades")
  });
});