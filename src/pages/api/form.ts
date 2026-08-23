import type { APIRoute } from 'astro';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { sendFormEmail } from '../../lib/form-mail';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = (await request.json()) as Record<string, unknown>;

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

    try {
      await sendFormEmail(entry);
    } catch (mailError) {
      console.error('[form] mail failed', mailError);
      return new Response(
        JSON.stringify({ success: false, message: 'Не удалось отправить заявку. Попробуйте позже или позвоните нам.' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        },
      );
    }

    console.log('[form] sent to sale@amplipuls.su', {
      name: entry.NAME,
      phone: entry.PHONE,
      email: entry.EMAIL,
      form: entry.FORM_CODE,
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('[form] error', e);
    return new Response(JSON.stringify({ success: false, message: 'Ошибка сервера' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
