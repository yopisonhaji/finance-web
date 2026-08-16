
async function run() {
  const res = await fetch('http://localhost:3000/api/bot/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenant_id: 'test',
      no_wa: '6281234567890',
      pesan: 'halo',
      message_type: 'text'
    })
  });
  const data = await res.json();
  console.log(data);
}
run();

