import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();

    if (!data.PHONE && !data.EMAIL) {
      return new Response(JSON.stringify({ success: false, message: 'Укажите телефон или email' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const entry = {
      ...data,
      receivedAt: new Date().toISOString(),
    };

    const dir = join(process.cwd(), '.submissions');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, `${Date.now()}.json`), JSON.stringify(entry, null, 2));

    console.log('[form]', entry);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, message: 'Ошибка сервера' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
