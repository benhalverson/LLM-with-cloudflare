import { Context } from 'hono';
import { toFile } from 'openai/uploads';
import OpenAI from 'openai';

export const createFile = async (c: Context, r20Object: R2Object) => {
	const openai: OpenAI = c.get("openai");

	const blob = await r20Object.blob();
	const file = await toFile(blob, r20Object.key);

	const uploadedFile = await openai.files.create({
		file,
		purpose: 'fine-tune',
	})

	return uploadedFile;
};
