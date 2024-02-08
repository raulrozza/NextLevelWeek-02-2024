import { type FastifyInstance } from 'fastify';
import z from 'zod';
import { voting } from '../utils/voting-pub-sub';

const schema = z.object({
  pollId: z.string().uuid(),
});

export async function pollResults(app: FastifyInstance) {
  app.post(
    '/polls/:pollId/results',
    { websocket: true },
    (connection, request) => {
      const { pollId } = schema.parse(request.params);

      voting.subscribe(pollId, message => {
        connection.socket.send(JSON.stringify(message));
      });
    },
  );
}
