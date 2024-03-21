const readline = require("readline");

function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(`${query}\n`, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

async function createTask(task) {
  try {
    const response = await fetch("http://localhost:3000/task", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
    });

    if (response.ok) {
      const data = await response.json();
      return JSON.stringify(data, null, 4);
    }

    return `Server responded with ${response.status}`;
  } catch (error) {
    return error instanceof Error ? error.message : "Something wen't wrong";
  }
}

module.exports = {
  askQuestion,
  createTask,
};
