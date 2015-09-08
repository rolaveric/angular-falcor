import 'babel/polyfill';
import angular from 'angular';
import falcor from './angularFalcor.js';
import template from './app.html!text';

class MyController {
  constructor($scope, falcor) {
    this.$scope = $scope;
    this.falcor = falcor;
    this.activated = false;

    this.page = 1;
    this.pageSize = 10;
    this.newName = '';

    // On load
    this.activate();
  }

  /**
   * Handles on load processing, like creating the FalcorJS model and loading initial data
   */
  activate() {
    // Define module, using cached data
    this.model = new this.falcor.Model({
        source: new this.falcor.HttpDataSource('/model.json')
      }).batch();
    this.activated = true;
  }

  /**
   * Creates a new todos item, setting it in the Falcor model and then retrieving the updated data.
   */
  addTodo() {
    if (this.newName) {
      // todos.add(name, done)
      this.model.call(['todos', 'add'], [{name: this.newName, done: false}])
        .subscribe(_ => this.$scope.$evalAsync());
      this.newName = '';
    }
  }

  /**
   * Updates the current page being viewed.
   * @param newPage {number}
   */
  changePage(newPage) {
    this.page = newPage;
  }
}
MyController.$inject = ['$scope', 'falcor'];

angular.module('falcorExample', [falcor])
  .directive('falcorSample', () => {
    return {
      template: template,
      controller: MyController,
      controllerAs: 'ctrl',
      bindToController: true,
      scope: {}
    };
  });