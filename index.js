import falcor from 'falcor';
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
      cache: {
        todos: [
          {
            name: 'get milk from corner store',
            done: false
          },
          {
            name: 'withdraw money from ATM',
            done: true
          }
        ]
      }});

    this.dataSubject()
      .subscribe(() => {
        this.activated = true;
      });
  }

  /**
   * Requests a set of TODOs from the Falcor model, returning an observable to subscribe to.
   * @returns {observable}
   */
  dataSubject() {
    const from = (this.page - 1) * this.pageSize;
    const to = (this.page * this.pageSize) - 1;
    return this.model.get(["todos", {from, to}, "name"], ["todos", "length"])
      .safeApply(this.$scope, (response) => {
        this.todos = Object.keys(response.json.todos) // Create a real array for ng-repeat to work with
          .reduce((memo, key) => {
            if (!isNaN(key)) {
              memo.push({index: Number(key), todo: response.json.todos[key]});
            }
            return memo;
          }, []);
        this.todosLength = response.json.todos.length; // Don't be fooled - this isn't the same as [].length
      });
  }

  /**
   * Creates a new todos item, setting it in the Falcor model and then retrieving the updated data.
   */
  addTodo() {
    const newTodoEnvelope = {
      json: {
        todos: {
          [this.todosLength]: { // ES6/ES2015 is the bomb!
            name: String(Math.random()),
            done: false
          },
          length: this.todosLength + 1 // That's right - we're responsible for updating this 'length' property
        }
      }
    };
    this.model.set(newTodoEnvelope)
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