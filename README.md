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
ssh vilmed   # или ssh root@217.28.220.186
cd /var/www/amplipuls_su_usr/data/www/amplipuls.su
```

Бэкап Bitrix (до миграции): `/var/www/amplipuls_su_usr/data/www/amplipuls.su.bitrix-backup-20250823`

Nginx проксирует на Node `127.0.0.1:3000` (было Apache `:81`). Бэкап конфига: `amplipuls.su.conf.bak-astro`.

### Деплой

**Повторный деплой** (после настройки):

```bash
cd /var/www/amplipuls_su_usr/data/www/amplipuls.su
bash scripts/deploy.sh
```

**Первичная настройка на сервере**

1. Node 22+ (`nvm install 22` под пользователем `amplipuls_su_usr`).
2. Клонировать репозиторий в каталог сайта:

```bash
cd /var/www/amplipuls_su_usr/data/www
# если в amplipuls.su ещё лежит Bitrix — сделайте бэкап и очистите каталог
git clone https://github.com/bziksv/amplipuls.git amplipuls.su
cd amplipuls.su
npm ci && npm run build
```

3. Systemd-сервис:

```bash
sudo cp deploy/amplipuls.service /etc/systemd/system/amplipuls.service
# при необходимости поправьте путь к node в unit-файле
sudo systemctl daemon-reload
sudo systemctl enable --now amplipuls
sudo systemctl status amplipuls
```

4. Nginx — проксировать `amplipuls.su` на `127.0.0.1:3000` (см. `deploy/nginx-amplipuls.conf`).
   В панели ISPmanager: отключить PHP/Bitrix для домена, добавить proxy location.

5. Проверка:

```bash
curl -I http://127.0.0.1:3000/
curl -I https://amplipuls.su/docs/obrabotka-personalnyh-dannyh/
```

Заявки с форм пишутся в `.submissions/` (каталог создаётся автоматически, в git не попадает).

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
