/**
 * Overrides Bitrix rxRunComponentAction after template.js loads.
 */
(function () {
  const formCache = {};
  const FORM_ASSET_VERSION = '20250823';
  const legalDocs = {
    politics: '/upload/politics-amplipuls.png',
    agreement: '/upload/soglasie-pdn-amplipuls.png',
  };

  async function loadForm(code) {
    if (formCache[code]) return formCache[code];
    const res = await fetch(`/data/forms/${code}.json?v=${FORM_ASSET_VERSION}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Form not found: ' + code);
    formCache[code] = await res.json();
    return formCache[code];
  }

  window.rxRunComponentAction = function (component, action, options = { data: {} }) {
    const post = options.data?.post || {};

    if (component === 'form' && action === 'getModal') {
      return loadForm(post.formCode).then((form) => {
        let body = form.body;
        if (post.formCode && !body.includes('name="FORM_CODE"')) {
          body = body.replace(
            '<div class="form-block">',
            '<input type="hidden" name="FORM_CODE" value="' +
              String(post.formCode).replace(/"/g, '&quot;') +
              '"><div class="form-block">',
          );
        }
        if (post.subject) {
          body = body.replace(
            'name="SOURCE" data-code="SOURCE" value=""',
            'name="SOURCE" data-code="SOURCE" value="' + String(post.subject).replace(/"/g, '&quot;') + '"'
          );
          if (!body.includes('name="SUBJECT"')) {
            body = body.replace(
              '<div class="form-block">',
              '<input type="hidden" name="SUBJECT" value="' +
                String(post.subject).replace(/"/g, '&quot;') +
                '"><div class="form-block">'
            );
          }
        }
        return { data: { title: form.title, body, class: form.class || '' } };
      });
    }

    if (component === 'form' && action === 'getPolitics') {
      window.open(legalDocs.politics, '_blank', 'noopener');
      return Promise.reject({ errors: [{ message: '' }] });
    }

    if (component === 'form' && action === 'getAgreement') {
      window.open(legalDocs.agreement, '_blank', 'noopener');
      return Promise.reject({ errors: [{ message: '' }] });
    }

    if (component === 'form' && action === 'submit') {
      const formData = options.data?.post || {};
      return fetch('/api/form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
        .then((res) => res.json())
        .then((json) => {
          if (!json.success) {
            return Promise.reject({ errors: [{ message: json.message || 'Ошибка отправки' }] });
          }
          return { data: { success: true } };
        });
    }

    // Card/video modals — not used on this landing
    if (component === 'block') {
      return Promise.reject({ errors: [{ message: '' }] });
    }

    return Promise.reject({ errors: [{ message: 'Unknown action' }] });
  };

  $(function () {
    $(document).off('click', '.js-form-politics');
    $(document).on('click', '.js-form-politics', function (event) {
      event.preventDefault();
      window.open(legalDocs.politics, '_blank', 'noopener');
    });

    $(document).off('click', '.js-form-agreement');
    $(document).on('click', '.js-form-agreement', function (event) {
      event.preventDefault();
      window.open(legalDocs.agreement, '_blank', 'noopener');
    });
  });
})();
