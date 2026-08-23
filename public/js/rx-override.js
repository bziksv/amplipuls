/**
 * Overrides Bitrix rxRunComponentAction after template.js loads.
 */
(function () {
  const formCache = {};

  async function loadForm(code) {
    if (formCache[code]) return formCache[code];
    const res = await fetch('/data/forms/' + code + '.json');
    if (!res.ok) throw new Error('Form not found: ' + code);
    formCache[code] = await res.json();
    return formCache[code];
  }

  window.rxRunComponentAction = function (component, action, options = { data: {} }) {
    const post = options.data?.post || {};

    if (component === 'form' && action === 'getModal') {
      return loadForm(post.formCode).then((form) => {
        let body = form.body;
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
      return Promise.resolve({
        data: {
          title: 'Политика обработки персональных данных',
          body: '<p style="margin:0 0 12px"><a href="/docs/obrabotka-personalnyh-dannyh/" target="_blank" rel="noopener">Открыть политику в новой вкладке</a></p><iframe src="/docs/obrabotka-personalnyh-dannyh/" title="Политика обработки персональных данных" style="width:100%;height:65vh;border:0;border-radius:4px"></iframe>',
        },
      });
    }

    if (component === 'form' && action === 'getAgreement') {
      return Promise.resolve({
        data: {
          title: 'Согласие на обработку персональных данных',
          body: '<p style="margin:0 0 12px"><a href="/docs/soglasie-pdn-amplipuls/" target="_blank" rel="noopener">Открыть согласие в новой вкладке</a></p><iframe src="/docs/soglasie-pdn-amplipuls/" title="Согласие на обработку персональных данных" style="width:100%;height:65vh;border:0;border-radius:4px"></iframe>',
        },
      });
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
})();
