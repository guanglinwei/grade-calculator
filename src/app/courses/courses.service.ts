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

    scoreToPoints(score: string | undefined, rawScore: string | undefined = undefined): number[] {
        let earnedPoints = 0;
        let totalPoints = 0;
        if(rawScore === undefined) rawScore = score;
        // matches: num / num num%
        // ex: 95 / 100 95.00%
        if(score) {
            // just the fraction part (95 / 100)
            [earnedPoints, totalPoints] = score.split('/').map(v => parseFloat(v));
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

        return [earnedPoints, totalPoints];
    }
    // TODO: deal with exempt/absent/missing/incomplete (can be dealt with), weighted/letter grades (error, add message to modal explaining),  etc...
    // TODO: import from ctrl+a, ctrl+c
    importCourseFromHTML(type: string, html: string, onErrorCallback: (e: unknown) => any = () => {}): boolean {
        try {
            switch(type) {
                // Ctrl + A, Ctrl + C for page
                case 'genesis': {
                    const assignInfoRegex = /([\S ]*)\s*(Recently\s*Updated)?\s*(([0-9]*[.])?[0-9]+\s+\/\s+([0-9]*[.])?[0-9]+|assignment\s*pts:\s*\d+\s*(exempt|absent|missing|incomplete))/gi; //([\S ]*)\s*(Recently\s*Updated)?\s*(\d+\s+\/\s+\d+)/g;
                    const assignList = [];
                    // const assignMatch = assignInfoRegex.exec(html);
                    let assignment = undefined;
                    const cname = /course summary for \s*(.*)\s*marking period/gi.exec(html)?.[1];

                    while(assignment = assignInfoRegex.exec(html)) {
                        const name = assignment[1];
                        const rawScore = assignment[3]
                        // const [earnedPoints, totalPoints] = rawScore.split('/').map(v => parseFloat(v) || 0);
                        const [earnedPoints, totalPoints] = this.scoreToPoints(rawScore.match(/([0-9]*[.])?[0-9]+\s*\/\s*([0-9]*[.])?[0-9]+/)?.[0], rawScore);
                        assignList.push({ name: name, earnedPoints: earnedPoints, totalPoints: totalPoints });
                    }
                    if(assignList.length < 1) {
                        throw new Error("!An error occurred. Please check your clipboard contents.");
                    }
                    else {
                        const res = new Course(cname || "", assignList);
                        // console.log(res);
                        this.courses.push(res);
                    }
                    break;
                }

                case 'genesishtml': {
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
                        // [earnedPoints, totalPoints] = this.matchScore(rawScore);
                        const scoreMatch = /(([0-9]*[.])?[0-9]+\s*\/\s*([0-9]*[.])?[0-9]+)\s*([0-9]*[.])?[0-9]+\s*%/.exec(rawScore || '');
                        [earnedPoints, totalPoints] = this.scoreToPoints(scoreMatch?.[1], rawScore);

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
                }
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