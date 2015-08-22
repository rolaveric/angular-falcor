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
      // Build a 'JSON Graph Response'
      return Promise.resolve({ // Using a Promise just to prove we can
        jsonGraph: {
          todos: pathSet.indexes.reduce((memo, index) => {
            memo[index] = data.todos[index];
            return memo;
          }, {})
        }
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
      const name = args[0], done = args[1];

      // Validate arguments
      if (!name || typeof name !== 'string') {
        throw new Error("invalid name value");
      }
      if (typeof done !== 'boolean') {
        throw new Error("invalid done value")
      }

      // Add new record to the data
      const newLength = data.todos.push({name, done});

      // Returns list of changed/invalidated paths
      return [
        {
          path: ['todos', newLength - 1, 'name'],
          value: name
        },
        {
          path: ['todos', newLength - 1, 'done'],
          value: done
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