import 'babel/polyfill';
import falcor from 'falcor';
import HttpDataSource from 'falcor-http-datasource';
import angular from 'angular';
import rxAngular from 'rx-angular';
import template from './app.html!text';

class MyController {
  constructor($scope) {
    this.$scope = $scope;
    this.activated = false;

    this.page = 1;
    this.pageSize = 10;

    // On load
    this.activate();
  }

  /**
   * Handles on load processing, like creating the FalcorJS model and loading initial data
   */
  activate() {
    // Define module, using cached data
    this.model = new falcor.Model({
        source: new HttpDataSource('/model.json')
      }).batch();
    this.activated = true;
  }

  /**
   * Creates a new todos item, setting it in the Falcor model and then retrieving the updated data.
   */
  addTodo() {
    // todos.add(name, done)
    this.model.call(['todos', 'add'], [String(Math.random()), false])
      .safeApply(this.$scope)
      .subscribe();
  }

  /**
   * Updates the current page being viewed.
   * @param newPage {number}
   */
  changePage(newPage) {
    this.page = newPage;
  }
}
MyController.$inject = ['$scope'];

/**
 * Generates a filter which simply calls 'getValue()' with a falcor model and path.
 * The idea is that it's stateless, meaning it will always return the same observable.
 * @returns {Function}
 */
function getValueFilterProvider($parse, $rootScope) {
  var inProgress = []; // A cache of async calls that are currently in progress
  return function getValueFilter(path, model) {
    if (model && path) {
      // Try to get the value from cache
      const value = $parse(path)(model.getCache(path));
      if (typeof value !== 'undefined') {
        return typeof value === 'object' ? value.value : value;
      }

      if (!inProgress.find((i) => i.model === model && i.path === path)) {
        // If the value isn't in cache, make the call and we'll get it on the next digest loop
        const cache = {model, path};
        inProgress.push(cache);
        model.getValue(path)
          .safeApply($rootScope)
          .subscribe(() => {
            // Invalidate the observable cache
            inProgress.splice(inProgress.findIndex((i) => i === cache), 1);
          });
      }
    }
  };
}
getValueFilterProvider.$inject = ['$parse', '$rootScope'];

/**
 * Generates a filter which produces a range of numbers for pagination.
 * Useful when all you have is an item count to iterate over.
 */
function pageRangeFilterProvider() {
  return function pageRangeFilter(itemCount, currentPage, pageSize) {
    itemCount = isNaN(itemCount) ? 0 : itemCount;
    currentPage = currentPage || 1;
    pageSize = pageSize || 5;
    const range = [];
    for (var x = (currentPage - 1) * pageSize; x < currentPage * pageSize && x < itemCount; x++) {
      range.push(x);
    }
    return range;
  };
}

angular.module('falcorExample', ['rx'])
  .directive('falcorSample', () => {
    return {
      template: template,
      controller: MyController,
      controllerAs: 'ctrl',
      bindToController: true,
      scope: {}
    };
  })
  .filter('rol_getValue', getValueFilterProvider)
  .filter('rol_pageRange', pageRangeFilterProvider);