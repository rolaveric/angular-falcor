import angular from 'angular';
import falcor from 'falcor';
import HttpDataSource from 'falcor-http-datasource';

export function falcorFactory($parse, $rootScope) {
  // Add the HttpDatasource to the falcor object
  falcor.HttpDataSource = HttpDataSource;

  // Add a 'getViewValue()' method to the Model prototype

  var inProgress = []; // async calls which are currently in progress
  /**
   * Attempts to return a value in a way that can be used directly from a template.
   *
   * Works by attempting to retrieve the value from the Model cache.
   * If it can't be found, it initiates an Observable to retrieve the value and returns undefined.
   * The intention being that the real value will eventually be returned on subsequent $digest loops.
   *
   * @param path {string|array} Path to the value on the Model that's required.  Must resolve to only a single value.
   */
  falcor.Model.prototype.getViewValue = function(path) {
    if (path) {
      // If the path is an array, join them together
      if (angular.isArray(path)) {
        path = path.reduce((memo, token, index) => {
          token = String(token);
          if (!isNaN(token)) {
            token = '[' + token + ']';
          } else if (/(^[0-9])|([^0-9a-zA-Z_\$])/.test(token)) {
            // If it starts with a number or contains anything other than letters, numbers, _ and $, wrap in brackets
            token = "['" + token + "']";
          } else if (index > 0) {
            token = '.' + token;
          }
          return memo + token;
        }, '');
      }

      // Try to get the value from the cache
      const value = $parse(path)(this.getCache(path));
      if (typeof value !== 'undefined') {
        return typeof value === 'object' ? value.value : value;
      }

      // If a call for the same path isn't already in progress...
      if (!inProgress.find((i) => i.model === this && i.path === path)) {
        // Make an async call for the value, and we'll get the result on the next digest loop
        const cache = {model: this, path: path};
        inProgress.push(cache);
        this.getValue(path)
          .subscribe(() => {
            // Invalidate the observable cache
            inProgress.splice(inProgress.findIndex((i) => i === cache), 1);

            // Make sure the $digest loop picks up on the change
            $rootScope.$evalAsync();
          });
      }
    }
  };

  /**
   * Returns a function which can be used with ngModelOptions `getterSetter: true` set.
   * @param path {string|Array} Path to the value on the Model that's being get and set.  Must resolve to only a single value.
   * @returns {Function}
   */
  falcor.Model.prototype.viewGetterSetter = function(path) {
    var model = this;
    return function (newValue) {
      return arguments.length
        ? model.setValue(path, newValue).subscribe(_ => $rootScope.$evalAsync())
        : model.getViewValue(path);
    }
  };

  return falcor;
}
falcorFactory.$inject = ['$parse', '$rootScope'];

/**
 * Generates a filter which produces a range of numbers for pagination.
 * Useful when all you have is an item count to iterate over.
 */
function pageRangeFilterProvider() {
  /**
   * Returns an array of indexes that can be used in pagination.
   * @param itemCount {number} Number of items being paged through, meaning max index must be itemCount - 1
   * @param [currentPage=1] {number} Current page number being viewed
   * @param [pageSize=5] {number} Max size of each page
   * @returns {number[]}
   */
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

angular.module('falcor', [])
  .factory('falcor', falcorFactory)
  .filter('pageRange', pageRangeFilterProvider);

export default 'falcor';