
import { inngest } from './src/inngest/client';

async function run() {
  try {
    console.log('Sending...');
    await inngest.send({
      name: 'wa/webhook.received',
      data: { tenantId: 'test', noWa: '123' }
    });
    console.log('Success');
  } catch (err) {
    console.error('Inngest Error:', err);
  }
}
run();

