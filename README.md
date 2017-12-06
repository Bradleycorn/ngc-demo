# Angular Compiler Regression demo

In the latest versions (v5.0.4 & v5.0.5) of the angular compiler (ngc), the compiler strips out class member variable initializations, resulting in code that at best doesn't work as it should, and at worst is completely broken and causes errors in the browser. 

## Running the demo to examine the problem

Running the demo is easy. clone the repo, then:
```
$ npm install
```

To compile with the angular compiler and see the (non-working) ngc output:
```
$ npm run build:ng
```

To compile with the typescript compiler and see the (working) tsc output:
```
$ npm run build:ts
```

To compare the source and output:
The MyService source file is at `src/my.service.ts`
And the compiled javascript is at `build/my.service.js`

The build commands will execute `ngc` or `tsc` to compile the source code. After the build is complete,
you can inspect the output in the `build/` folder, specifically the `build/my.service.js` file,
to see it's compiled output.

## What is the problem?

Consider the `src/my.service.ts` Angular Service class contained in this repo:
```
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

```

When compiled with `ngc`, the result will be:
```
import { Injectable } from "@angular/core";
import { Subject } from "rxjs/Subject";
var MyService = /** @class */ (function () {
    function MyService() {
        this.observable = this.subject.asObservable();
        if (this.someValue === 1) {
            this.constructValue = 5;
        }
    }
    /**
     * @return {?}
     */
    MyService.prototype.isWorking = /**
     * @return {?}
     */
    function () {
        return (this.constructValue === 5);
    };
    return MyService;
}());
```

Note that 2 member variables, `this.subject` and `this.someValue` are initialized at declaration in the source typescript,
but those initializations are stripped entirely in the compiled output javascript. Because of that, the compiled class will not work as it is written. 

The first line in the constructor will cause an error. 

The second part of the constructor will result in unexpected behavior. `This.someValue` is 
not set, and thus `this.constructValue` will not get set to `5`. As a result, 
calls to the class's `isWorking` method will return `false`, though the way the 
code is written, it should return `true`. 

Contrast that with the javascript that is output when compiling with the `tsc` typescript compiler:
```
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';
var MyService = /** @class */ (function () {
    function MyService() {
        this.subject = new Subject();
        this.someValue = 1;
        this.observable = this.subject.asObservable();
        if (this.someValue === 1) {
            this.constructValue = 5;
        }
    }

    MyService.prototype.isWorking = function () {
        return (this.constructValue === 5);
    };
    MyService = __decorate([
        Injectable()
    ], MyService);
    return MyService;
}());
export { MyService };
```

Note that with the typescript compiler, the initializations are maintained, and moved into the constructor
and the code works as expected.
```
    function MyService() {
        this.subject = new Subject();
        this.someValue = 1;

        ...
```        