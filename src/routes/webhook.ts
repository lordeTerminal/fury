import { Router, Request, Response } from 'express';
import { violationSchema } from '../schemas/violation.schema';
import { enqueueTakedown } from '../queues/takedown.queue';

const router = Router();

router.post('/violation', async (req: Request, res: Response) => {
  const result = violationSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      error: 'Payload inválido',
      details: result.error.flatten(),
    });
  }

  const jobId = await enqueueTakedown(result.data);

  return res.status(202).json({ jobId });
});

export default router;
