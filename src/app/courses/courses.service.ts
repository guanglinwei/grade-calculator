import { enableProdMode, Injectable } from "@angular/core";
import { enableDebugTools } from "@angular/platform-browser";
import { Course } from "src/models/course";

@Injectable({
    providedIn: 'root',
})

export class CoursesService {
    courses: Course[] = [];
    currentCourse?: Course;

    constructor() {}

    getCourses(): Course[] {
        return this.courses;
    }

    getCourse(name: string | null): Course | undefined {
        return name === null ? undefined : this.courses.find(c => c.name === name);
    }

    exportDataAsJson(): void {
        localStorage.setItem("gradeData", JSON.stringify({
            //placeholder
            name: "Guang-Lin",
            courses: this.courses,
        }));
    }

    importDataFromJson(): Promise<any> {
        return new Promise((resolve) => {
            // console.log(localStorage.getItem("gradeData"));
            const json = JSON.parse(localStorage.getItem("gradeData") || "{}").courses;
            for(const v of json) {
                this.courses.push(new Course(v.name, v.assignmentList));
            }
            // console.log(this.courses);
            resolve(undefined);
        });
        
    }
}