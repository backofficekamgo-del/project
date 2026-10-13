const form = document.querySelector('#contractor-form');
const errorsBox = document.querySelector('#form-errors');
const successBox = document.querySelector('#success-message');

form.addEventListener('submit', (event) => {
  event.preventDefault();
  successBox.textContent = '';
  const data = Object.fromEntries(new FormData(form).entries());
  ['passportSeries', 'passportNumber', 'inn', 'snils', 'bik', 'accountNumber', 'correspondentAccount']
    .forEach((key) => { if (data[key]) data[key] = digits(data[key]); });
  const errors = validateContractor(data);
  errorsBox.innerHTML = errors.length ? `<ul>${errors.map((error) => `<li>${error}</li>`).join('')}</ul>` : '';
  if (errors.length) return;
  localStorage.setItem('contractorQuestionnaire', JSON.stringify(data));
  successBox.textContent = 'Данные успешно сохранены. Спасибо!';
  form.reset();
});
