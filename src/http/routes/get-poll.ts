import { type FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma';
import z from 'zod';

export async function getPoll(app: FastifyInstance) {
  app.get('/polls/:pollId', async (request, reply) => {
    const getParamSchema = z.object({
      pollId: z.string().uuid(),
    });

    const { pollId } = getParamSchema.parse(request.params);

    const poll = await prisma.poll.findUnique({
      where: {
        id: pollId,
      },
      include: {
        options: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return await reply.send({ poll });
  });
}
