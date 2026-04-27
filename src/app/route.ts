import { readFile } from 'fs/promises'
import path from 'path'

// Serve public/index.html as the landing page at /
export async function GET() {
  const html = await readFile(
    path.join(process.cwd(), 'public', 'index.html'),
    'utf-8'
  )
  return new Response(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })
}
