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

The tool for this job is `$scope.$apply()`, but we have to be 100% sure that another `$scope.$apply()` call isn't already in progress or it will thrown an error.  
Since FalcorJS natively uses and embraces observables with RxJS, my solution was to use the [`Observable.prototype.safeApply()`](https://github.com/Reactive-Extensions/rx.angular.js/blob/master/src/safeApply.js) method provided by [`rx-angular`](https://github.com/Reactive-Extensions/rx.angular.js/).

# References

* [FalcorJS Website](http://netflix.github.io/falcor/)
    * [Calling Functions](http://netflix.github.io/falcor/documentation/model.html#calling-functions): particularly important for operations like 'add()' and 'remove()'
* [FalcorJS Router Demo](https://github.com/Netflix/falcor-router-demo)
* [FalcorJS Express Demo](https://github.com/Netflix/falcor-express-demo): Uses `falcor-router-demo` as the router.
* [BabelJS](https://babeljs.io/): Awesome ES2015 (ES6) transpiler
    * [ES2015 Reference](https://babeljs.io/docs/learn-es2015/)
* [Reactive Extensions (Rx)](http://reactivex.io/)
    * [RxJS](https://github.com/Reactive-Extensions/RxJS)
    * [AngularJS Bindings for RxJS](https://github.com/Reactive-Extensions/rx.angular.js/)