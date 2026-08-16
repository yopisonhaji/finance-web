import { OpenAI } from 'openai';
import * as fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Store chat history temporarily in memory
const chatHistories: Record<string, any[]> = {};

const tools = [
    {
        type: "function",
        function: {
            name: "execute_command",
            description: "Executes a shell command on the Windows/Linux VPS.",
            parameters: {
                type: "object",
                properties: {
                    command: { type: "string" }
                },
                required: ["command"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "read_file",
            description: "Reads the content of a file.",
            parameters: {
                type: "object",
                properties: {
                    filepath: { type: "string" }
                },
                required: ["filepath"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "write_file",
            description: "Writes content to a file. Overwrites the file with new content.",
            parameters: {
                type: "object",
                properties: {
                    filepath: { type: "string" },
                    content: { type: "string" }
                },
                required: ["filepath", "content"]
            }
        }
    }
];

const systemInstruction = "Anda adalah Autonomous DevOps AI Agent untuk server VPS. Anda memiliki kemampuan mengeksekusi shell command, membaca dan menulis file. Jika ada error, cari letaknya, gunakan tools untuk memperbaikinya, dan restart service terkait jika perlu. SELALU jelaskan apa yang Anda lakukan secara singkat dan padat ke pengguna. HATI-HATI saat mengeksekusi perintah. Sebelum mengubah kode penting, beri tahu pengguna.";

async function executeTool(name: string, args: any) {
    try {
        if (name === "execute_command") {
            const { stdout, stderr } = await execAsync(args.command, { maxBuffer: 1024 * 1024 * 10 });
            return { stdout: stdout || "", stderr: stderr || "" };
        }
        if (name === "read_file") {
            const data = fs.readFileSync(args.filepath, 'utf8');
            return { success: true, data };
        }
        if (name === "write_file") {
            fs.writeFileSync(args.filepath, args.content, 'utf8');
            return { success: true };
        }
    } catch (e: any) {
        return { error: e.message };
    }
    return { error: "Tool not found" };
}

export async function processDevOpsCommand(
    chatId: string,
    prompt: string,
    botToken: string,
    sendMessageFn: (chatId: string, text: string, token: string) => Promise<void>
) {
    const apiKey = process.env.DEEPSEEK_API_KEY || process.env.MASTER_DEEPSEEK_KEY;
    
    if (!apiKey) {
        await sendMessageFn(chatId, "⚠️ API Key DeepSeek belum dikonfigurasi. Harap set DEEPSEEK_API_KEY di .env.local", botToken);
        return;
    }

    const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com/v1',
        apiKey: apiKey
    });

    if (!chatHistories[chatId]) {
        chatHistories[chatId] = [{ role: "system", content: systemInstruction }];
    }
    
    chatHistories[chatId].push({ role: "user", content: prompt });

    try {
        await sendMessageFn(chatId, "⏳ Agent DevOps sedang memproses instruksi...", botToken);
        
        let isDone = false;
        
        while (!isDone) {
            const response = await openai.chat.completions.create({
                model: "deepseek-chat",
                messages: chatHistories[chatId],
                // @ts-ignore
                tools: tools,
                tool_choice: "auto"
            });
            
            const responseMessage = response.choices[0].message;
            chatHistories[chatId].push(responseMessage);
            
            if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
                for (const toolCall of responseMessage.tool_calls) {
                    if (toolCall.type === "function") {
                        const args = JSON.parse(toolCall.function.arguments);
                        await sendMessageFn(chatId, `🛠 Menjalankan Tool: ${toolCall.function.name}\n${JSON.stringify(args).substring(0, 100)}...`, botToken);
                        
                        const toolResult = await executeTool(toolCall.function.name, args);
                        
                        chatHistories[chatId].push({
                            tool_call_id: toolCall.id,
                            role: "tool",
                            name: toolCall.function.name,
                            content: JSON.stringify(toolResult)
                        });
                    }
                }
            } else {
                isDone = true;
                if (responseMessage.content) {
                    await sendMessageFn(chatId, responseMessage.content, botToken);
                }
            }
        }
    } catch (e: any) {
        console.error("DevOps Agent Error:", e);
        await sendMessageFn(chatId, `❌ Error dari Agent DevOps: ${e.message}`, botToken);
    }
}
