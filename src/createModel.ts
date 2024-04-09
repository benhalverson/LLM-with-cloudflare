import { Context } from 'hono';
import OpenAI from 'openai';

export const createModel = async (c: Context, fileId: string) => {
	const openai: OpenAI = c.get("openai");

	const body = {
		training_file: fileId,
		model: 'gpt-3.5-turbo',
	}

	return openai.fineTuning.jobs.create(body);
};
