/** Реквизиты из politics-amplipuls.png / cookies-amplipuls.png / rules-recomendation-amplipuls.png */
export const legalSite = {
  operatorName: 'ООО «АЛЬМАМЕД»',
  operatorShort: 'ООО «АЛЬМАМЕД»',
  inn: '3663147243',
  ogrn: '1153661007406',
  site: 'https://amplipuls.su/',
  siteHost: 'amplipuls.su',
  email: 'sale@amplipuls.su',
  phone: '+7 (499) 322-98-09',
  phoneSecondary: '+7 (473) 229-96-07',
  phoneTel: '+74993229809',
  phoneSecondaryTel: '+74732299607',
  addressLegal:
    '394026, Россия, Воронежская обл., г. Воронеж, Московский пр-кт, д. 19, помещ. 1/46',
  addressStore:
    '394026, Россия, Воронежская обл., г. Воронеж, Московский пр-кт, д. 19, помещ. 1/46',
  urls: {
    personalData: '/upload/politics-amplipuls.png',
    consent: '/upload/soglasie-pdn-amplipuls.png',
    cookie: '/upload/cookies-amplipuls.png',
    recommendation: '/upload/rules-recomendation-amplipuls.png',
  },
} as const;

/** Сторонние сервисы, реально используемые на amplipuls.su (Layout.astro, body.html). */
export const legalThirdPartiesOnSite = [
  'mc.yandex.ru / mc.yandex.com — Яндекс.Метрика',
  'api-maps.yandex.ru / core-renderer-tiles.maps.yandex.net — Яндекс.Карты',
] as const;
