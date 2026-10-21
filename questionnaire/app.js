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

// Для MVP используется небольшой демонстрационный справочник. В рабочей версии
// его заменим на актуальный справочник банков или API.
const bankDirectory = {
  '044525225': { name: 'ПАО Сбербанк', correspondentAccount: '30101810400000000225' },
  '044525187': { name: 'Банк ВТБ (ПАО)', correspondentAccount: '30101810145250000187' },
  '044525593': { name: 'АО «Альфа-Банк»', correspondentAccount: '301018102000005935' },
  '044525974': { name: 'АО «ТБанк»', correspondentAccount: '30101810145250000974' },
  '044525700': { name: 'АО «Райффайзенбанк»', correspondentAccount: '30101810200000000700' }
};

bikInput.addEventListener('input', () => {
  const record = bankDirectory[digits(bikInput.value)];
  if (!record) return;
  bankInput.value = record.name;
  correspondentInput.value = record.correspondentAccount;
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
