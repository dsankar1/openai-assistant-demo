const express = require("express");
const bodyParser = require("body-parser");
const uuid = require("uuid");
const app = express();
const port = 3000;

let tasks = [];

app.use(bodyParser.json());

app.get("/task", (_req, res) => {
  res.json(tasks);
});

app.post("/task", (req, res) => {
  const task = {
    ...req.body,
    id: uuid.v4(),
  };

  tasks = [...tasks, task];
  res.json(task);
});

app.listen(port, () => {
  console.log(`Task app listening on port ${port}`);
});
