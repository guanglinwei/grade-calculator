import { Component, ElementRef, HostListener, isDevMode, OnInit, ViewChild } from '@angular/core';
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
  @ViewChild('importJsonModal') importJsonModal!: ElementRef;

  @ViewChild('importGenesisErrorMessage') importGenesisErrorMessage!: ElementRef;
  @ViewChild('importJsonErrorMessage') importJsonErrorMessage!: ElementRef;

  @HostListener('document:keyup', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if(event.key === 'Enter') this.modalDismiss('delete', true);
  }

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
        this.setModalVisibility(this.importGenesisErrorMessage, false);
        break;

      case 'importjson':
        this.setModalVisibility(this.importJsonModal, true);
        this.setModalVisibility(this.importJsonErrorMessage, false);
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

      case 'importjson':
        this.setModalVisibility(this.importJsonModal, false);
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
        if(typeof params[0] !== 'boolean') throw new Error(`importModal activation requires 1 parameter of type boolean, got ${typeof params[0]}`);

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
                this.importGenesisErrorMessage.nativeElement.textContent = errorMessage || "An error occurred. Please check your clipboard contents.";
                this.setModalVisibility(this.importGenesisErrorMessage, true);
              });
            });   
        }
        break;

      case 'importjson':
        this.modalInactive('importjson');
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

  exportToJson(): void {
    const element = document.createElement("a");
    element.setAttribute('href', `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify({courses: this.coursesService.getCourses()}))}`);
    element.setAttribute('download', "gradesData.json");
    element.click();
    element.remove();
  }

  handleFileInput(event: Event): void {
    const el = (event.target as HTMLInputElement);
    const file = el.files?.item(0);
    if(!file || !file.type.includes('json')) {
      this.importJsonErrorMessage.nativeElement.textContent = `File must be of type .json`
      this.setModalVisibility(this.importJsonErrorMessage, true);
    }
    else {
      file.text().then((v) => {
        this.coursesService.importDataFromJson(v).then(() => {
          this.setModalVisibility(this.importJsonModal, false);
        }, () => {
          this.importJsonErrorMessage.nativeElement.textContent = "An error occurred when parsing this file. Are you sure it was exported by this site?"
          this.setModalVisibility(this.importJsonErrorMessage, true);
        });
      });
    }
  }
}
