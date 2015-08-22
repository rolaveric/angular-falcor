import falcor from 'falcor';
import HttpDataSource from 'falcor-http-datasource';
import angular from 'angular';
import rxAngular from 'rx-angular';
import template from './app.html!text';

class MyController {
  constructor($scope) {
    this.todos = {};
    this.todosLength = 0;
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
      });

    this.dataSubject()
      .subscribe();
  }

  /**
   * Requests a set of TODOs from the Falcor model, returning an observable to subscribe to.
   * @returns {observable}
   */
  dataSubject() {
    const from = (this.page - 1) * this.pageSize;
    const to = (this.page * this.pageSize) - 1;
    return this.model.get(["todos", {from, to}, ["name", "done"]], ["todos", "length"])
      .safeApply(this.$scope, (response) => {
        this.todos = Object.keys(response.json.todos) // Create a real array for ng-repeat to work with
          .filter((key) => !isNaN(key) && Number(key) < response.json.todos.length)
          .map(key => ({index: Number(key), todo: response.json.todos[key]}));
        this.todosLength = response.json.todos.length; // Don't be fooled - this isn't the same as [].length
        this.activated = true;
      });
  }

  /**
   * Creates a new todos item, setting it in the Falcor model and then retrieving the updated data.
   */
  addTodo() {
    // todos.add(name, done)
    this.model.call(['todos', 'add'], [String(Math.random()), false])
      .subscribe(() => {
        this.dataSubject().subscribe()
      });
  }

  /**
   * Updates the current page being viewed.
   * @param newPage {number}
   */
  changePage(newPage) {
    this.page = newPage;
    this.dataSubject().subscribe();
  }
}
MyController.$inject = ['$scope'];

angular.module('falcorExample', ['rx'])
  .directive('falcorSample', () => {
    return {
      template: template,
      controller: MyController,
      controllerAs: 'ctrl',
      bindToController: true,
      scope: {}
    };
  });