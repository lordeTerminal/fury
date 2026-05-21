import { Router, Request, Response } from 'express';
import { takedownQueue } from '../queues/takedown.queue';

const router = Router();

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  const job = await takedownQueue.getJob(id);

  if (!job) {
    return res.status(404).json({ error: 'Job não encontrado' });
  }

  const state = await job.getState();

  return res.status(200).json({
    jobId: job.id,
    status: state,
    attempts: job.attemptsMade,
    result: job.returnvalue ?? null,
    error: job.failedReason ?? null,
  });
});

export default router;
