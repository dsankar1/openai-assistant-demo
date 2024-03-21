require("dotenv").config();
const { OpenAI } = require("openai");
const { askQuestion, createTask } = require("./utils");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function main() {
  const content = await askQuestion("What do you need help with?\n");
  console.log("\nOne moment...\n");

  const assistant = await openai.beta.assistants.retrieve(
    process.env.ASSISTANT_ID
  );

  const thread = await openai.beta.threads.create({
    messages: [
      {
        role: "user",
        content,
      },
    ],
  });

  const run = await openai.beta.threads.runs.create(thread.id, {
    assistant_id: assistant.id,
  });

  await new Promise((resolve) => {
    let isSubmittingTools = false;

    const checkStatus = async () => {
      const { status, required_action } =
        await openai.beta.threads.runs.retrieve(thread.id, run.id);

      if (
        status === "requires_action" &&
        required_action?.type === "submit_tool_outputs" &&
        !isSubmittingTools
      ) {
        isSubmittingTools = true;

        required_action.submit_tool_outputs.tool_calls.forEach((toolCall) => {
          if (toolCall.function.name == "create_task") {
            const task = JSON.parse(toolCall.function.arguments);

            const handleCreateTask = async () => {
              const data = await createTask(task);

              await openai.beta.threads.runs.submitToolOutputs(
                thread.id,
                run.id,
                {
                  tool_outputs: [
                    {
                      tool_call_id: toolCall.id,
                      output: data,
                    },
                  ],
                }
              );
            };

            handleCreateTask();
          }
        });
      }

      if (status === "completed") {
        resolve(run.id);
      } else {
        setTimeout(checkStatus, 500);
      }
    };

    checkStatus();
  });

  const messages = await openai.beta.threads.messages.list(thread.id);

  console.log(
    `${messages.data?.[0]?.content[0]?.text?.value ?? "No response"}\n`
  );
}

main();
