import {expect} from '@loopback/testlab';
import {
  TodoListImageRepository,
  TodoListRepository,
  TodoRepository,
} from '../../repositories';
import {
  givenEmptyDatabase,
  givenTodoInstance,
  givenTodoListInstance,
  testdb,
} from '../helpers';
import {TodoListController} from '../../controllers';

describe('TodoController', () => {
  let todoListImageRepo: TodoListImageRepository;
  let todoListRepo: TodoListRepository;
  let todoRepo: TodoRepository;

  before(async () => {
    todoListRepo = new TodoListRepository(
      testdb,
      async () => todoRepo,
      async () => todoListImageRepo,
    );
    todoRepo = new TodoRepository(testdb, async () => todoListRepo);
  });

  beforeEach(givenEmptyDatabase);
  it('returns TodoList and the most recently updated todo.', async () => {
    //create 2 todolists
    const list1 = await givenTodoListInstance(todoListRepo);
    const list2 = await givenTodoListInstance(todoListRepo);

    await givenTodoInstance(todoRepo, {
      todoListId: list1.id,
      updatedAt: Date.now(),
    });
    await givenTodoInstance(todoRepo, {
      todoListId: list1.id,
      updatedAt: Date.now() + 1000,
    });
    await givenTodoInstance(todoRepo, {
      todoListId: list2.id,
      updatedAt: Date.now(),
    });
    await givenTodoInstance(todoRepo, {
      todoListId: list2.id,
      updatedAt: Date.now() + 1000,
    });
    const controller = new TodoListController(todoListRepo);
    const data = await controller.find({
      include: [
        {
          relation: 'todos',
          scope: {
            limit: 10, // some number larger than the no of todo list returned
            order: ['updatedAt DESC'],
          },
        },
      ],
    });

    expect(data.length).to.equal(2);
    expect(data[0].todos.length).to.equal(2);
    expect(data[1].todos.length).to.equal(2);
  });

  it('does not but should return TodoList and the most recently updated todo.', async () => {
    //create 2 todolists
    const list1 = await givenTodoListInstance(todoListRepo);
    const list2 = await givenTodoListInstance(todoListRepo);

    await givenTodoInstance(todoRepo, {
      todoListId: list1.id,
      updatedAt: Date.now(),
    });
    await givenTodoInstance(todoRepo, {
      todoListId: list1.id,
      updatedAt: Date.now() + 1000,
    });
    await givenTodoInstance(todoRepo, {
      todoListId: list2.id,
      updatedAt: Date.now(),
    });
    await givenTodoInstance(todoRepo, {
      todoListId: list2.id,
      updatedAt: Date.now() + 1000,
    });
    const controller = new TodoListController(todoListRepo);
    const data = await controller.find({
      include: [
        {
          relation: 'todos',
          scope: {
            limit: 1,
            order: ['updatedAt DESC'],
          },
        },
      ],
    });

    expect(data.length).to.equal(2);
    expect(data[0].todos.length).to.equal(1);
    expect(data[1].todos.length).to.equal(1);
  });
});
