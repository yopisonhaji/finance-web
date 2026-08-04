import fetch from "node-fetch";

async function main() {
  const payload = {
    sender: "6283805004255",
    message: "Halo"
  };

  console.log("Sending payload:", payload);
  
  const res = await fetch("http://127.0.0.1:3000/api/webhook-wa", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  console.log("Response:", JSON.stringify(data, null, 2));
}

main();
