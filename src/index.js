const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).json({ error: "username already exists!" });
  }
  request.user = user;
  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userExist = users.find((user) => user.username === username);

  if (userExist) {
    return response.status(400).json({ error: "username already exists!" });
  }

  const user = {
    username,
    name,
    id: uuidv4(),
    todos: [],
    created_at: new Date(),
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    title,
    id: uuidv4(),
    deadline: new Date(deadline).toISOString(),
    created_at: new Date(),
    done: false,
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;
  const { id } = request.params;
  const todoIndex = user.todos.findIndex((todo) => id === todo.id);

  if (todoIndex) {
    return response.status(404).json({ error: "todo already exists!" });
  }

  todo = {
    ...user.todos[todoIndex],
    id,
    title,
    deadline,
  };

  user.todos[todoIndex] = todo;

  return response.json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todoIndex = user.todos.findIndex((todo) => id === todo.id);

  if (todoIndex) {
    return response.status(404).json({ error: "todo already exists!" });
  }

  todo = {
    ...user.todos[todoIndex],
    done: true,
  };

  user.todos[todoIndex] = todo;

  return response.json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const todoIndex = user.todos.findIndex((todo) => id === todo.id);

  if (todoIndex) {
    return response.status(404).json({ error: "todo already exists!" });
  }

  user.todos = user.todos.filter((todo) => id !== todo.id);

  return response.status(204).json();
});

module.exports = app;
