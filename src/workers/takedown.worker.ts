import { Worker, Job } from 'bullmq';
import axios from 'axios';
import { redis } from '../lib/redis';
import { ViolationPayload } from '../schemas/violation.schema';

const META_API_SIMULATION = 'https://jsonplaceholder.typicode.com/posts/1';

async function processTakedown(job: Job<ViolationPayload>): Promise<object> {
  console.log(`[Worker] Processando job ${job.id} - adId: ${job.data.adId}`);

  try {
    const response = await axios.get(META_API_SIMULATION, { timeout: 5000 });

    if (response.status >= 200 && response.status < 300) {
      console.log(`[Worker] Job ${job.id} concluído com sucesso`);
      return { success: true, statusCode: response.status };
    }

    throw new Error(`Status inesperado: ${response.status}`);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const message = error.message;
      console.error(`[Worker] Falha no job ${job.id}: ${message}`);
      throw new Error(`Meta API error: ${status ?? 'timeout'} - ${message}`);
    }
    throw error;
  }
}

const worker = new Worker('takedown', processTakedown, {
  connection: redis,
  concurrency: 5,
});

worker.on('completed', (job) => {
  console.log(`[Worker] ✅ Job ${job.id} completado`);
});

worker.on('failed', (job, err) => {
  console.error(`[Worker] ❌ Job ${job?.id} falhou: ${err.message}`);
});

console.log('[Worker] 🚀 Aguardando jobs...');
