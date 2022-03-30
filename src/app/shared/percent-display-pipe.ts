import { Pipe, PipeTransform } from "@angular/core";

@Pipe({ name: "percentDisplay" })

export class PercentDisplayPipe implements PipeTransform {
    transform(num: number | string, denom: number | string): string {
        let n = parseFloat(num.toString());
        let d = parseFloat(denom.toString());
        return d === 0 ? "0.00" : (100 * n / d).toFixed(2).toString();
    }
}