import { enableProdMode, Injectable } from "@angular/core";
import { enableDebugTools } from "@angular/platform-browser";
import { Assignment } from "src/models/assignment";
import { Course } from "src/models/course";

@Injectable({
    providedIn: 'root',
})

export class CoursesService {
    courses: Course[] = [];
    currentCourse?: Course;

    constructor() {}

    getCourses(): Course[] {
        this.courses.forEach(c => c.recalculateValues());
        return this.courses;
    }

    getCourse(name: string | null): Course | undefined {
        return name === null ? undefined : this.courses.find(c => c.name === name);
    }

    exportDataAsJson(): void {
        localStorage.setItem("gradeData", JSON.stringify({
            courses: this.courses,
        }));
    }

    importDataFromJson(jsonStr: string): Promise<void> {
        return new Promise((resolve, reject) => {
            // console.log(localStorage.getItem("gradeData"));
            let json;
            try {
                json = JSON.parse(jsonStr).courses;
            }
            catch {
                reject("Invalid JSON file");
                return;
            }

            if(json) {
                for(const v of json) {
                    this.courses.push(new Course(v.name, v.assignmentList));
                }
                resolve();
            }
            else {
                this.courses = [];
                reject("Blank JSON file");
            }
        });
        
    }
    // TODO: deal with exempt/absent/missing/incomplete (can be dealt with), weighted/letter grades (error, add message to modal explaining),  etc...
    importCourseFromHTML(type: string, html: string, onErrorCallback: (e: unknown) => any = () => {}): boolean {
        try {
            switch(type) {
                case 'genesis':
                    const parser = new DOMParser();
                    const obj = parser.parseFromString(html, 'text/html');
                    const table = obj.getElementsByClassName("list")[0];

                    // last element of table is the absences table, not relevant
                    //if(table.children[0].lastElementChild) table.children[0].removeChild(table.children[0].lastElementChild);

                    // console.log(table);

                    const list = [];
                    // the grade table alternates between even and odd list rows (for css styling)
                    const evens = table.getElementsByClassName("listroweven");
                    const odds = table.getElementsByClassName("listrowodd");
                    
                    for(let i = 0; i < evens.length; i++) {
                        list[i * 2] = evens.item(i);
                    }
                    for (let i = 0; i < odds.length; i++) {
                        list[i * 2 + 1] = odds.item(i);
                    }

                    const assignList: Assignment[] = [];

                    for(const v of list) {
                        const multipleSpaces = / +(?= )/g;
                        //v.children[4, 5] are name, score
                        const rawName = v?.children[4]?.textContent?.replace(multipleSpaces, '');
                        const rawScore = v?.children[5]?.textContent?.replace(multipleSpaces, '');
                        if(rawName === undefined) continue;

                        let name = "";
                        let earnedPoints = 0;
                        let totalPoints = 0;

                        // matches: string ... Comment from ...
                        // rawName is in format <assignment name> Comment from <teacher>: ...
                        const nameMatch = /^(.*?)Comment from/is.exec(rawName || '');
                        if(nameMatch) {
                            // just assignment name
                            name = nameMatch[1].trim();
                        }
                        else {
                            if(rawName) name = rawName.trim();
                        }
                        // matches: num / num num%
                        // ex: 95 / 100 95.00%
                        const scoreMatch = /(([0-9]*[.])?[0-9]+\s*\/\s*([0-9]*[.])?[0-9]+)\s*([0-9]*[.])?[0-9]+\s*%/.exec(rawScore || '');
                        if(scoreMatch) {
                            // just the fraction part (95 / 100)
                            [earnedPoints, totalPoints] = scoreMatch[1].split('/').map(v => parseFloat(v));
                        }
                        // if a score is not provided (exempt, absent, incomplete, missing, or letter grades)
                        else {
                            const s = rawScore?.toLowerCase() || '';
                            if(s.includes("exempt") || s.includes("absent")) [earnedPoints, totalPoints] = [0, 0];
                            else if(s.includes("missing") || s.includes("incomplete")) {
                                const t = /assignment pts:\s*([0-9]+)/.exec(s);
                                [earnedPoints, totalPoints] = [0, t ? parseFloat(t[1]) : 0];
                            }
                            else {
                                console.error("There is an issue with the following score: \n" + rawScore?.trim());
                                throw new Error("!Courses with letter grades cannot be imported.");
                            }
                        }

                        assignList.push({ name: name, earnedPoints: earnedPoints, totalPoints: totalPoints });
                    }

                    const courseNameList = obj.getElementById("fldCourse");
                    let name = "";
                    if(courseNameList && courseNameList.children) {
                        for(let i = 0; i < courseNameList.children.length; i++) {
                            const item = courseNameList.children.item(i);
                            if(item?.hasAttribute("selected") && item.textContent) {
                                name = item.textContent.trim();
                                break;
                            }
                        }
                    }
                    const res = new Course(name, assignList);
                    // console.log(res);
                    this.courses.push(res);
                    break;
                default:
                    break;
            }
            return true;
        }
        catch(e: unknown) {
            console.error(e);
            onErrorCallback(e);
            return false;
        }
    }
}