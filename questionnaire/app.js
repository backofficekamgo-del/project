const form = document.querySelector('#contractor-form');
const errorsBox = document.querySelector('#form-errors');
const successBox = document.querySelector('#success-message');
const bikInput = form.elements.bik;
const bankInput = form.elements.bankName;
const correspondentInput = form.elements.correspondentAccount;
const civilServantSelect = form.elements.wasCivilServant;
const civilServiceDetails = document.querySelector('#civil-service-details');
const civilServiceDetailsInput = form.elements.civilServiceDetails;
const actualAddressSame = form.elements.actualAddressSame;
const actualAddressField = document.querySelector('#actual-address-field');
const actualAddressInput = form.elements.actualAddress;
const dadataTokenInput = document.querySelector('#dadata-token');
const saveDadataTokenButton = document.querySelector('#save-dadata-token');
const tokenStatus = document.querySelector('#token-status');

// Токен не хранится в исходниках и не попадает в отправляемую анкету.
// Для локальной демонстрации его можно задать в консоли браузера:
// localStorage.setItem('dadataToken', '...')
// Если токен отсутствует или DaData недоступна, используется встроенный справочник.
const DADATA_TOKEN = localStorage.getItem('dadataToken') || '';
if (dadataTokenInput && DADATA_TOKEN) dadataTokenInput.value = DADATA_TOKEN;
saveDadataTokenButton?.addEventListener('click', () => {
  const token = dadataTokenInput.value.trim();
  if (token) {
    localStorage.setItem('dadataToken', token);
    tokenStatus.textContent = 'Токен сохранён в этом браузере. Обновите страницу.';
  } else {
    localStorage.removeItem('dadataToken');
    tokenStatus.textContent = 'Токен удалён. Используется встроенный справочник.';
  }
});

// Для MVP используется небольшой демонстрационный справочник. В рабочей версии
// его заменим на актуальный справочник банков или API.
const bankDirectory = {
  '044525225': { name: 'ПАО Сбербанк', correspondentAccount: '30101810400000000225' },
  '044525187': { name: 'Банк ВТБ (ПАО)', correspondentAccount: '30101810145250000187' },
  '044525593': { name: 'АО «Альфа-Банк»', correspondentAccount: '301018102000005935' },
  '044525974': { name: 'АО «ТБанк»', correspondentAccount: '30101810145250000974' },
  '044525700': { name: 'АО «Райффайзенбанк»', correspondentAccount: '30101810200000000700' }
};

const applyBankRecord = (record) => {
  if (!record) return;
  bankInput.value = record.name || '';
  correspondentInput.value = record.correspondentAccount || '';
};

const lookupBank = (bik) => {
  if (!DADATA_TOKEN) return Promise.resolve(bankDirectory[bik]);
  return fetch('https://suggestions.dadata.ru/suggestions/api/4_1/rs/suggest/bank', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Token ${DADATA_TOKEN}` },
    body: JSON.stringify({ query: bik, count: 1 })
  }).then((response) => response.ok ? response.json() : Promise.reject(new Error('DaData error')))
    .then((result) => {
      const value = result.suggestions && result.suggestions[0] && result.suggestions[0].data;
      return value ? { name: value.name && (value.name.payment || value.name.short || value.name.full), correspondentAccount: value.correspondent_account } : null;
    });
};

bikInput.addEventListener('input', () => {
  const bik = digits(bikInput.value);
  if (bik.length !== 9) return;
  lookupBank(bik).then(applyBankRecord).catch(() => applyBankRecord(bankDirectory[bik]));
});

civilServantSelect.addEventListener('change', () => {
  const isRequired = civilServantSelect.value === 'Да';
  civilServiceDetails.hidden = !isRequired;
  civilServiceDetailsInput.required = isRequired;
  if (!isRequired) civilServiceDetailsInput.value = '';
});

actualAddressSame.addEventListener('change', () => {
  const same = actualAddressSame.value === 'Да';
  actualAddressField.hidden = same;
  actualAddressInput.required = !same;
  if (same) actualAddressInput.value = form.elements.registrationAddress.value;
  if (!same) actualAddressInput.value = '';
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  successBox.textContent = '';
  const data = Object.fromEntries(new FormData(form).entries());
  if (data.actualAddressSame === 'Да') data.actualAddress = data.registrationAddress;
  data.fullName = [data.lastName, data.firstName, data.middleName].filter(Boolean).join(' ');
  ['passportSeries', 'passportNumber', 'inn', 'snils', 'bik', 'accountNumber', 'correspondentAccount']
    .forEach((key) => { if (data[key]) data[key] = digits(data[key]); });
  const errors = validateContractor(data);
  errorsBox.innerHTML = errors.length ? `<ul>${errors.map((error) => `<li>${error}</li>`).join('')}</ul>` : '';
  if (errors.length) return;
  localStorage.setItem('contractorQuestionnaire', JSON.stringify(data));
  successBox.innerHTML = 'Анкета успешно отправлена. Данные переданы кадровику.';
  form.reset();
});
