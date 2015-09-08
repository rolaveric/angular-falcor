# FalcorJS + Angular v1 example

A quick example of using [FalcorJS](https://netflix.github.io/falcor/) with [AngularJS v1](https://angularjs.org/).

# Setup

Install dependencies from both npm and jspm

`npm install`

Start server

`npm start`

Open [http://localhost:9090](http://localhost:9090)

# How it works

The key to making FalcorJS work with AngularJS is getting it slotted nicely into the digest loop so that changes are detected and shown on the view.    
Since FalcorJS is making it's own async http calls without `$http`, we need to let AngularJS know when a change may have occurred.

The usual tool for this job is `$scope.$apply()`, but we have to be 100% sure that another `$scope.$apply()` call isn't already in progress or it will thrown an error.  
We could use `$timeout()` to achieve the same thing, but it will always cause a new digest loop to occur, even if there's already one in progress.  
A [better alternative](http://www.bennadel.com/blog/2605-scope-evalasync-vs-timeout-in-angularjs.htm) is to use `$scope.$evalAsync()` which gives us the best of both worlds.  
Since FalcorJS returns Observables, we simply call `$scope.$evalAsync()` when subscribing to an Observable.

# References

* [FalcorJS Website](http://netflix.github.io/falcor/)
    * [Calling Functions](http://netflix.github.io/falcor/documentation/model.html#calling-functions): particularly important for operations like 'add()' and 'remove()'
* [FalcorJS Router Demo](https://github.com/Netflix/falcor-router-demo)
* [FalcorJS Express Demo](https://github.com/Netflix/falcor-express-demo): Uses `falcor-router-demo` as the router.
* [BabelJS](https://babeljs.io/): Awesome ES2015 (ES6) transpiler
    * [ES2015 Reference](https://babeljs.io/docs/learn-es2015/)
* [Reactive Extensions (Rx)](http://reactivex.io/)
    * [RxJS](https://github.com/Reactive-Extensions/RxJS)
* Observable Specifications
    * [Jafar Husain's Observable Specification](https://github.com/jhusain/observable-spec)
    * [zenparsing's Observable Type Proposal](https://github.com/zenparsing/es-observable)