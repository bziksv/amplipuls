/**
 * Bitrix BX stub — must load before template.js
 */
window.BX = window.BX || {};
BX.message = BX.message || { SITE_ID: 's1' };
BX.bitrix_sessid = () => 'static';
BX.ajax = BX.ajax || {};
BX.ajax.runComponentAction = () => Promise.reject({ errors: [{ message: 'Use rx-override' }] });
