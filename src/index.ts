export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	ASSETS: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

import { Context, Hono } from 'hono';
import Openai from 'openai';
import { createFile } from './createFile';
import { createModel } from './createModel';
import { stream, streamText, streamSSE } from 'hono/streaming';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';

const app = new Hono();

app.use(logger());
app.use(cors());

app.get('', (c) => {
	return c.text("health check");
});

app.get('/sse', async (c: Context) => {
	const content = c.req.query('question');
	c.header('Content-Type', 'text/event-stream');
	c.header('Cache-Control', 'no-cache');
	c.header('Connection', 'keep-alive');
	const data = {
		"model": "dolphin-mixtral",
		"messages": [
			{
				"role": "user",
				content,
				"stream": true
			}
		]
	};

	try {
		const response = await fetch('http://localhost:11434/api/chat', {
			'method': 'POST',
			'body': JSON.stringify(data)
		});
		if (response.body) {

			const body = response.body;
			return stream(c, async (stream) => {
				for await (const chunk of body) {
					const decoder = new TextDecoder('utf-8');
					const decoderString = decoder.decode(chunk, { stream: true });
					// only return the message key in the response
					// console.log(decoderString);
					// stream.write(`${decoderString}\n\n`);
					try {
						const json = JSON.parse(decoderString);
						if (json && json.message && json.message.content) {
							stream.write(`data: ${json.message.content}\n\n`);
						}
					} catch (error) {
						console.log('error', error);
					}
				};
				return stream.close();
			});
		}
	} catch (error) {
		console.log('error', error);
	}
	// return c.text('Failed to get response from model', 500);
});

app.post('/files', async (c: Context) => {
	const filesParam = c.req.query('files');
	if (!filesParam) {
		return c.text('No files provided');
	}

	const file = await c.env.ASSETS.get(filesParam);
	if (!file) {
		return c.text('File not found');
	};

	const uploadedFile = await createFile(c, file);
	return c.json(uploadedFile);
});


app.get('/models', async (c) => {
	const fileId = c.req.query('file_id');
	if (!fileId) {
		return c.text('No file provided');
	}

	const uploadedModel = await createModel(c, fileId);
	return c.json(uploadedModel);
});

export default app;
