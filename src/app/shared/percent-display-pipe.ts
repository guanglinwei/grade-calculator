import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "percentDisplay" })

export class PercentDisplayPipe implements PipeTransform {
    transform(num: number, denom: number): string {
        return denom === 0 ? "0.00" : (100 * num / denom).toFixed(2).toString();
    }
}