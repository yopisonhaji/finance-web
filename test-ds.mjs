import Database from 'better-sqlite3';

const dbPath = 'C:/Users/yulis/Documents/Data_Keuangan_Pesantren/finance.db';
const db = new Database(dbPath);

const row = db.prepare("SELECT nilai FROM pengaturan WHERE kunci = 'deepseek_key'").get();

if (!row) {
  console.log("DeepSeek Key tidak ditemukan di database.");
  process.exit(1);
}

const aiKey = row.nilai;
console.log("API Key (masked):", aiKey.substring(0, 5) + "..." + aiKey.substring(aiKey.length - 4));

async function testDeepSeek() {
  const response = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${aiKey}`
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [{ role: "user", content: "Test" }],
      temperature: 0.3
    })
  });

  const data = await response.json();
  console.log("Status Code:", response.status);
  console.log("Response Body:", JSON.stringify(data, null, 2));
}

testDeepSeek();
