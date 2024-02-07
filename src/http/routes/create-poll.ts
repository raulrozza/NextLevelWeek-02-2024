import { type FastifyInstance } from 'fastify';
import { prisma } from '../../lib/prisma';
import z from 'zod';

export async function createPoll(app: FastifyInstance) {
  app.post('/polls', async (request, reply) => {
    const createBodySchema = z.object({
      title: z.string(),
      options: z.array(z.string()),
    });

    const { title, options } = createBodySchema.parse(request.body);

    const poll = await prisma.poll.create({
      data: {
        title,
        options: {
          createMany: {
            data: options.map(option => ({ title: option })),
          },
        },
      },
    });

    return await reply.status(201).send({ pollId: poll.id });
  });
}
