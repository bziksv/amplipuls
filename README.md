# Амплипульс — Astro

Статическая копия лендинга [amplipuls.su](https://amplipuls.su/) без Bitrix.

## Репозиторий

- GitHub: [github.com/bziksv/amplipuls](https://github.com/bziksv/amplipuls)

```bash
git clone https://github.com/bziksv/amplipuls.git
cd amplipuls
```

## Сервер (продакшн)

| Параметр | Значение |
|----------|----------|
| Домен | [amplipuls.su](https://amplipuls.su/) |
| IP | `217.28.220.186` |
| Путь на сервере | `/var/www/amplipuls_su_usr/data/www/amplipuls.su` |

```bash
ssh user@217.28.220.186
cd /var/www/amplipuls_su_usr/data/www/amplipuls.su
```

### Деплой

```bash
# на сервере
cd /var/www/amplipuls_su_usr/data/www/amplipuls.su
git pull origin main
npm ci
npm run build
HOST=0.0.0.0 PORT=4321 npm run start
# или перезапустить systemd/pm2-сервис
```

## Юридические страницы

| Документ | URL |
|----------|-----|
| Политика обработки ПДн | `/docs/obrabotka-personalnyh-dannyh/` |
| Согласие на обработку ПДн | `/docs/soglasie-pdn-amplipuls/` |
| Политика cookie | `/docs/politika-fajlov-cookie/` |
| Рекомендательные технологии | `/docs/pravila-rekomendatelnyh-tehnologij/` |

Контент: `src/data/legal/`, страницы: `src/pages/docs/`, стили: `public/css/legal.css`.

## Запуск локально

```bash
nvm use          # Node 22+
npm install
npm run dev      # http://localhost:4321
```

## Команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер |
| `npm run build` | Сборка |
| `npm run preview` | Превью продакшн-сборки |
| `npm run start` | Запуск собранного сервера (после `build`) |
| `npm run migrate` | Повторно скачать HTML/ассеты с amplipuls.su |

## Структура

- `src/data/body.html` — HTML страницы (из Bitrix)
- `public/css/` — оригинальные стили
- `public/js/template.js` — jQuery, Bootstrap, Slick, Fancybox (из шаблона)
- `public/js/rx-override.js` — формы вместо Bitrix API
- `src/pages/api/form.ts` — приём заявок (сохраняет в `.submissions/`)

## Формы

Заявки сохраняются локально в `.submissions/*.json`. Для продакшна подключите отправку на email/Telegram в `src/pages/api/form.ts`.

## Яндекс.Карты

Карта работает через публичный API. Для продакшна получите API-ключ и добавьте в URL в `Layout.astro`.
