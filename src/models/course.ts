import { Assignment } from "./assignment";

export class Course {
    name: string;
    totalPoints: number;
    points: number;
    private assignmentList: Assignment[]; // [[earned points, total points, assignment name], [earned, total, name], ...]
    average: string;

    constructor(name: string, assignmentList: Assignment[]) {
        this.name = name;
        // this.totalPoints = totalPoints;
        // this.points = points;
        this.assignmentList = assignmentList;
        // if(this.assignmentList.length === 0) {
        //     this.points = 0;
        //     this.totalPoints = 0;
        // }
        // else {
            this.points = assignmentList.map(v => v.earnedPoints).reduce((p, c) => p + c, 0);
            this.totalPoints = assignmentList.map(v => v.totalPoints).reduce((p, c) => p + c, 0);
        // }
        this.average = this.getAverageDisplay();
    }

    recalculateValues(): void {
        this.points = this.assignmentList.map(v => v.earnedPoints).reduce((p, c) => p + c, 0);
        this.totalPoints = this.assignmentList.map(v => v.totalPoints).reduce((p, c) => p + c, 0);
        this.average = this.getAverageDisplay();
    }

    getAssignment(index: number): Assignment {
        return this.assignmentList[index];
    }

    getAssignmentList(): Assignment[] {
        return this.assignmentList;
    }

    addAssignment(score: Assignment): Assignment {
        this.assignmentList.push(score);
        this.recalculateValues();
        return score;
    }
    
    editAssignment(index: number, assignment: Assignment): Assignment {
        if(index >= this.assignmentList.length) throw new Error(`Index ${index} out of bounds for editAssignment`);
        this.assignmentList[index] = assignment;
        this.recalculateValues();
        return assignment;
    }

    removeAssignment(index: number): boolean {
        if(index >= this.assignmentList.length) return false;
        this.assignmentList.splice(index, 1);
        this.recalculateValues();
        return true;
    }

    getAverageDisplay(dp: number = 2): string {
        return this.totalPoints === 0 ? '-' : (this.points * 100.0 / this.totalPoints).toFixed(dp);
    }
}