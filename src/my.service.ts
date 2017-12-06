import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';


@Injectable()
export class MyService {
    private observable: Observable<any>;
    private constructValue;

    // Go ahead and initialize the following 2 members. 
    // This demos the main problem, when compiled down to js
    // using the angular compiler, these initializations will be lost.
    private subject: Subject<any> = new Subject<any>();
    private someValue = 1;
 
    constructor() {
        // In the compiled js output, this line will cause an error, 
        // because this.subject will be undefined. The ngc compiler
        // strips out the above declaration and initialization entirely. 
        this.observable = this.subject.asObservable();

        // In the compiled js output, the statement inside this if
        // will NOT be executed, because again the ng compiler
        // strips out the initialization of this.someValue. 
        if (this.someValue === 1) {
            this.constructValue = 5;
        }
    }

    // Given the above code, a call to isWorking should return true.
    // However, in the compiled js, it will return false because
    // this.constructValue is not set (see the comments above in the constructor). 
    public isWorking(): boolean {
        return (this.constructValue === 5);
    }
}
