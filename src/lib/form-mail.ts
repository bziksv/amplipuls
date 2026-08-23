import { spawn } from 'node:child_process';

export const FORM_MAIL_TO = process.env.FORM_MAIL_TO || 'sale@amplipuls.su';
const MAIL_FROM = process.env.MAIL_FROM || 'noreply@amplipuls.su';
const SENDMAIL_PATH = process.env.SENDMAIL_PATH || '/usr/sbin/sendmail';

const FORM_LABELS: Record<string, string> = {
  NAME: 'Имя',
  PHONE: 'Телефон',
  EMAIL: 'E-mail',
  QUESTION: 'ИНН и реквизиты / сообщение',
  SOURCE: 'Страница-источник',
  SUBJECT: 'Тема',
  FORM_CODE: 'Форма',
};

const FORM_TITLES: Record<string, string> = {
  ranx_landing_form_order: 'Оставить заявку',
  ranx_landing_form_callback: 'Заказать звонок',
};

function formatValue(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(', ');
  if (value === null || value === undefined) return '';
  return String(value);
}

function buildSubject(data: Record<string, unknown>): string {
  const subject = formatValue(data.SUBJECT).trim();
  if (subject) return `amplipuls.su — ${subject}`;

  const formCode = formatValue(data.FORM_CODE).trim();
  const formTitle = FORM_TITLES[formCode];
  if (formTitle) return `amplipuls.su — ${formTitle}`;

  const name = formatValue(data.NAME).trim();
  if (name) return `amplipuls.su — заявка от ${name}`;

  return 'amplipuls.su — новая заявка с сайта';
}

function buildBody(data: Record<string, unknown>): string {
  const skip = new Set(['AGREEMENT', 'sessid', 'SITE_ID', 'settingId']);
  const lines: string[] = [];

  for (const [key, value] of Object.entries(data)) {
    if (skip.has(key)) continue;
    const formatted = formatValue(value).trim();
    if (!formatted) continue;
    const label = FORM_LABELS[key] || key;
    if (key === 'FORM_CODE' && FORM_TITLES[formatted]) {
      lines.push(`${label}: ${FORM_TITLES[formatted]} (${formatted})`);
      continue;
    }
    lines.push(`${label}: ${formatted}`);
  }

  if (data.receivedAt) {
    lines.push(`Получено: ${formatValue(data.receivedAt)}`);
  }

  return lines.join('\n');
}

function encodeSubject(subject: string): string {
  if (/^[\x20-\x7E]*$/.test(subject)) return subject;
  return `=?UTF-8?B?${Buffer.from(subject, 'utf8').toString('base64')}?=`;
}

async function sendViaSendmail(message: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const proc = spawn(SENDMAIL_PATH, ['-t', '-i'], { stdio: ['pipe', 'pipe', 'pipe'] });
    let stderr = '';

    proc.stderr.on('data', (chunk) => {
      stderr += String(chunk);
    });
    proc.on('error', reject);
    proc.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(stderr.trim() || `sendmail exited with code ${code}`));
    });

    proc.stdin.write(message);
    proc.stdin.end();
  });
}

export async function sendFormEmail(data: Record<string, unknown>): Promise<void> {
  const replyTo = formatValue(data.EMAIL).trim();
  const subject = encodeSubject(buildSubject(data));
  const body = buildBody(data);

  const headers = [
    `From: ${MAIL_FROM}`,
    `To: ${FORM_MAIL_TO}`,
    replyTo ? `Reply-To: ${replyTo}` : '',
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
  ].filter(Boolean);

  const message = `${headers.join('\r\n')}\r\n\r\n${body}\r\n`;
  await sendViaSendmail(message);
}
