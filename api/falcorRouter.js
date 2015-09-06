/**
 * Creates a Falcor Router which delivers a virtual JSON Graph of a "Todo list" model.
 *
 * {
 *  todos: {
 *    [index]: {
 *      name: string,
 *      done: boolean
 *    },
 *    add: (name: string, done: boolean) => {},
 *    remove: (index: integer)
 *  }
 * }
 */

import Router from 'falcor-router';
import jsonGraph from 'falcor-json-graph';

// Instead of using a real database, just going to cheat and keep it in memory - for demo purposes
const data = {
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
};

export const TodoRouter = Router.createClass([
  // Todo items
  {
    route: "todos[{integers:indexes}]['name', 'done']",
    // Gets items
    get: function (pathSet) {
      // Build a set of PathValues
      const pathValues = pathSet.indexes.reduce((memo, index) => {
        memo.push(
          {path: ['todos', index, 'name'], value: data.todos[index].name},
          {path: ['todos', index, 'done'], value: data.todos[index].done}
        );
        return memo;
      }, []);

      // Using a promise which resolves after 2 seconds to mimic latency
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('resolving');
          resolve(pathValues);
        }, 2000);
      });
    },

    // Updates items
    set: function (jsonGraphArg) {
      return Object.keys(jsonGraphArg.todos)
        .reduce((memo, index) => {
          const args = jsonGraphArg.todos[index];
          const todo = data.todos[index];

          // Check if existing record is defined
          if (!todo) {
            ['name', 'done'].forEach((key) => {
              if (args.hasOwnProperty(key)) {
                memo.push(
                  {path: ['todos', index, key], value: jsonGraph.error(`Todo ${index} not found`)}
                );
              }
            });
          } else {
            // Apply changes
            ['name', 'done'].forEach((key) => {
              if (args.hasOwnProperty(key)) {
                todo[key] = args[key];
                memo.push(
                  {path: ['todos', index, key], value: args[key]}
                );
              }
            });
          }
          return memo;
        }, []);
    }
  },

  // Simulates access to todo items count
  {
    route: "todos.length",
    get: function () {
      return Promise.resolve({
        jsonGraph: {
          todos: {
            length: data.todos.length
          }
        }
      });
    }
  },

  // Handles 'todos.add(name: string, done: boolean)' function calls
  {
    route: 'todos.add',
    call: function (callPath, args) {
      const newItem = args[0];

      // Validate arguments
      // TODO: Use JSON Schema to simplify this
      if (!newItem.name || typeof newItem.name !== 'string') {
        throw new Error("invalid name value");
      }
      if (typeof newItem.done !== 'boolean') {
        throw new Error("invalid done value")
      }

      // Add new record to the data
      const newLength = data.todos.push({name: newItem.name, done: newItem.done});

      // Returns list of changed/invalidated paths
      return [
        {
          path: ['todos', newLength - 1, 'name'],
          value: newItem.name
        },
        {
          path: ['todos', newLength - 1, 'done'],
          value: newItem.done
        },
        {
          path: ['todos', 'length'],
          value: newLength
        }
      ];
    }
  },

  // Handles 'todos.remove(index)' function calls
  {
    route: 'todos.remove',
    call: function (callPath, args) {
      const index = args[0];

      // Validate arguments
      if (isNan(index) || index < 0 || index >= data.todos.length) {
        throw new Error("invalid index");
      }

      // Remove record from data
      data.todos.splice(index, 1);

      // Returns list of changed/invalidated paths
      return [
        {
          path: ['todos', {from: index, to: data.todos.length}, 'name'],
          invalidated: true
        },
        {
          path: ['todos', 'length'],
          value: data.todos.length
        }
      ];
    }
  }
]);

export const todoRouterFactory = () => new TodoRouter();