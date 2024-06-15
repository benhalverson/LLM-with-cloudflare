import { Ollama } from 'ollama'

const ollama = new Ollama({ host: 'http://localhost:11434' })
const response = await ollama.chat({
  model: 'command-r-plus',
  messages: [{ role: 'user', content: 'Why is the sky blue?' }],
})

console.log('Ollama response:', response.message.content)
