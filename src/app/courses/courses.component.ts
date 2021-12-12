import { Component, ElementRef, isDevMode, OnInit, ViewChild } from '@angular/core';
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
  @ViewChild('importConfirmModal') importConfirmModal!: ElementRef;

  @ViewChild('importErrorMessage') importErrorMessage!: ElementRef;

  courses: Course[] = [];

  toDelete?: string;
  toDeleteIndex?: number;

  _html: string = "";

  constructor(private coursesService: CoursesService, private router: Router) { 

  }

  ngOnInit(): void {
    this.courses = this.coursesService.getCourses();
  }

  // ngAfterViewInit(): void {
  //   this.deleteModalClassList = this.deleteConfirmModal.nativeElement.classList;
  // }

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

  setModalVisibility(modal: ElementRef, visible: boolean): void {
    const cList = modal.nativeElement.classList;
    if(visible && !cList.contains("visible")) cList.add("visible");
    if(!visible && cList.contains("visible")) cList.remove("visible");
    modal.nativeElement.attributes["aria-hidden"].value = !visible;
  }

  modalActive(modalName: string, ...params: any[]): void {
    switch(modalName) {
      case 'delete':
        if(typeof params[0] !== 'number') throw new Error(`deleteModal activation requires 1 parameter of type number, got ${typeof params[0]}`);
        const index = params[0];
        if(index >= this.courses.length || index < 0) throw new Error(`Index ${index} is invalid`);

        this.toDelete = this.courses[index].name;
        this.toDeleteIndex = index;
        this.setModalVisibility(this.deleteConfirmModal, true);
        break;

      case 'import':
        this.setModalVisibility(this.importConfirmModal, true);
        this.setModalVisibility(this.importErrorMessage, false);
        break;

      default:
        break;
    }
  }

  modalInactive(modalName: string, ...params: any[]): void {
    switch(modalName) {
      case 'delete':
        this.toDelete = undefined;
        this.toDeleteIndex = undefined;
        this.setModalVisibility(this.deleteConfirmModal, false);
        break;

      case 'import':
        this.setModalVisibility(this.importConfirmModal, false);
        break;

      default:
        break;
    }
  }

  modalDismiss(modalName: string, ...params: any[]): void {
    switch(modalName) {
      case 'delete':
        if(typeof params[0] !== 'boolean') throw new Error(`deleteModal activation requires 1 parameter of type boolean, got ${typeof params[0]}`);

        const doDelete = params[0];
        if(doDelete && this.toDeleteIndex !== undefined) {
          if(this.courses.length == 0) this.courses = [];
          else this.courses.splice(this.toDeleteIndex, 1);
        }

        this.modalInactive(modalName);
        break;

      case 'import':
        if(typeof params[0] !== 'boolean') throw new Error(`deleteModal activation requires 1 parameter of type boolean, got ${typeof params[0]}`);

        const doImport = params[0];
        if(doImport) {
          navigator.clipboard.readText()
            .then((result) => {
              // display loading thing?
              this._html = result;
              this.importCoursesFromGenesis().then(() => {
                // succeed, hide modal
                this.modalInactive(modalName);
              }, (errorMessage) => {
                // fail, error message
                this.importErrorMessage.nativeElement.textContent = errorMessage || "An error occurred. Please check your clipboard contents.";
                this.setModalVisibility(this.importErrorMessage, true);
              });
            });   
        }
        break;

      default:
        break;
    }
  }

  async importCoursesFromGenesis(): Promise<void> {
    return new Promise((res, rej) => {
      let eMessage = undefined;
      if(!this.coursesService.importCourseFromHTML('genesis', this._html, (e: unknown) => {
        if(typeof e === "string") {
          eMessage = e;
          if(isDevMode()) console.error(e);
        }
        else if (e instanceof Error) {
          eMessage = e.message;
          if(isDevMode()) console.error(e.message);
        }   
      })) {
        let s = eMessage || '';
        if(s.charAt(0) === '!') rej(s.slice(1));
        else rej(undefined);
      }
      else res();
    }); 
  }

  setHtmlValue(event: Event): void {
    this._html = (event.target as HTMLInputElement).value;
  }
}