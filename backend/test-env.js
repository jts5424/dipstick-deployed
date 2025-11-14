import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
console.log('Current directory:', __dirname)
console.log('Loading .env from:', join(__dirname, '.env'))

dotenv.config()

console.log('\n=== Environment Variable Test ===')
console.log('OPENAI_API_KEY exists?', !!process.env.OPENAI_API_KEY)
console.log('OPENAI_API_KEY value:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'NOT FOUND')
console.log('OPENAI_API_KEY length:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0)

if (process.env.OPENAI_API_KEY) {
  console.log('\n✓ SUCCESS: API key is loaded!')
} else {
  console.log('\n✗ FAILED: API key is NOT loaded')
  console.log('\nMake sure:')
  console.log('1. The .env file exists at: backend/.env')
  console.log('2. It contains: OPENAI_API_KEY=sk-your-key-here')
  console.log('3. There are no spaces around the = sign')
}

