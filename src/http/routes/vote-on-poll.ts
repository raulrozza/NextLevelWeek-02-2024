import { type FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma';
import z from 'zod';

const paramsSchema = z.object({
  pollId: z.string().uuid(),
});
const bodySchema = z.object({
  pollOptionId: z.string().uuid(),
});

export async function voteOnPoll(app: FastifyInstance) {
  app.post('/polls/:pollId/votes', async (request, reply) => {
    const { pollId } = paramsSchema.parse(request.params);
    const { pollOptionId } = bodySchema.parse(request.body);

    return reply.status(201).send();
  });
}
