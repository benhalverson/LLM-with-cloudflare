
import { Ollama } from 'ollama-node';
import fs from 'node:fs';

const client = new Ollama()
await client.setModel('command-r');

await client.setSystemPrompt("You are an AI assistant.");
const print = (word: string) => {
	process.stdout.write(word);
}
async function main() {
	// const filePath = './web/index.html'; // Replace with your file path

	// const fileContent = await new Promise<string>((resolve, reject) => {
	// 	fs.readFile(filePath, 'utf8', (err, data) => {
	// 		if (err) {
	// 			reject(err);
	// 		} else {
	// 			resolve(data);
	// 		}
	// 	});
	// });

	// await client.loadContent(fileContent);

	// const response = await client.streamingGenerate(fileContent);
	// const response = await client.streamingGenerate('Hello world', print);
	const response = await client.generate('tell me a joke');

	console.log('Response:', response);


}

main();
