import fastify from 'fastify';
import { getPoll } from './routes/get-poll';
import { createPoll } from './routes/create-poll';
import { voteOnPoll } from './routes/vote-on-poll';
import fastifyCookie from '@fastify/cookie';
import fastifyWebsocket from '@fastify/websocket';
import { pollResults } from './ws/poll-results';

const app = fastify();

app.register(fastifyCookie, {
  secret: 'polls-app-nlw',
  hook: 'onRequest',
});

app.register(fastifyWebsocket);
app.register(createPoll);
app.register(getPoll);
app.register(voteOnPoll);
app.register(pollResults);

app
  .listen({ port: 3333 })
  .then(() => {
    console.log('HTTP server running');
  })
  .catch(error => {
    console.error(error.message);
  });
