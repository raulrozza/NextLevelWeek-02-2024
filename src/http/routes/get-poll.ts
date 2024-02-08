import { type FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma';
import z from 'zod';
import { redis } from '../../lib/redis';

const schema = z.object({
  pollId: z.string().uuid(),
});

export async function getPoll(app: FastifyInstance) {
  app.get('/polls/:pollId', async (request, reply) => {
    const { pollId } = schema.parse(request.params);

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

    if (!poll) reply.status(400).send({ message: 'Poll not found' });

    const result = await redis.zrange(pollId, 0, -1, 'WITHSCORES');
    const votes = result.reduce<Record<string, number>>((obj, line, index) => {
      const isEven = index % 2;

      if (isEven) {
        const score = result[index + 1];

        return {
          ...obj,
          [line]: Number(score),
        };
      }

      return obj;
    }, {});

    return reply.send({
      poll: {
        ...poll,
        options: poll?.options.map(option => ({
          ...option,
          score: votes[option.id] || 0,
        })),
      },
    });
  });
}
