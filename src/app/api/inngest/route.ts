import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { processMetaMessage } from "../../../inngest/functions";
import { scheduleFollowUp } from "../../../inngest/wa-functions";

// Create an API that serves zero-downtime background jobs
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    processMetaMessage, // Register our function here
    scheduleFollowUp,
  ],
});
