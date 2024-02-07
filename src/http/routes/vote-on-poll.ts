import {
  type FastifyRequest,
  type FastifyInstance,
  type FastifyReply,
} from 'fastify';
import { prisma } from '../../lib/prisma';
import z from 'zod';
import { randomUUID } from 'crypto';

const paramsSchema = z.object({
  pollId: z.string().uuid(),
});
const bodySchema = z.object({
  pollOptionId: z.string().uuid(),
});

const COOKIE_VALIDITY = 60 * 60 * 24 * 30; // 30 days

export async function voteOnPoll(app: FastifyInstance) {
  app.post('/polls/:pollId/votes', async (request, reply) => {
    const { pollId } = paramsSchema.parse(request.params);
    const { pollOptionId } = bodySchema.parse(request.body);

    const sessionId = getSessionId(request, reply);

    const previousVote = await prisma.vote.findUnique({
      where: {
        sessionId_pollId: {
          pollId,
          sessionId,
        },
      },
    });

    if (previousVote?.pollOptionId === pollOptionId)
      return reply.status(400).send({
        message: 'You have already voted on this poll',
      });

    if (previousVote) {
      await prisma.vote.delete({ where: { id: previousVote.id } });
    }

    await prisma.vote.create({
      data: {
        pollId,
        pollOptionId,
        sessionId,
      },
    });

    return reply.status(201).send();
  });

  function getSessionId(request: FastifyRequest, reply: FastifyReply) {
    const storedCookie = request.cookies.sessionId;

    if (storedCookie) return storedCookie;

    const sessionId = randomUUID();

    reply.setCookie('sessionId', sessionId, {
      path: '/',
      maxAge: COOKIE_VALIDITY,
      signed: true,
      httpOnly: true,
    });

    return sessionId;
  }
}
