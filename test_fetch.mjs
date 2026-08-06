async function test() {
  try {
    const botUrl = "http://127.0.0.1:8081";
    const res = await fetch(`${botUrl}/api/wa/status`);
    console.log("Status:", res.status);
    const data = await res.text();
    console.log("Data:", data);
  } catch (e) {
    console.error("Fetch Error:", e);
  }
}
test();
