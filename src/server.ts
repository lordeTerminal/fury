import express from 'express';
import webhookRouter from './routes/webhook';
import jobsRouter from './routes/jobs';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/webhook', webhookRouter);
app.use('/jobs', jobsRouter);

app.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`[Server] 🚀 Rodando na porta ${PORT}`);
});
