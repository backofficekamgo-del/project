const raw = localStorage.getItem('contractorQuestionnaire');
const empty = document.querySelector('#empty');
const application = document.querySelector('#application');
const created = document.querySelector('#created');

if (raw) {
  const data = JSON.parse(raw);
  empty.hidden = true;
  application.hidden = false;
  document.querySelector('#name').textContent = data.fullName || 'Подрядчик';
  document.querySelector('#submitted').textContent = new Date().toLocaleString('ru-RU');
  document.querySelector('#create').addEventListener('click', () => {
    const documentText = `ДОГОВОР ОКАЗАНИЯ УСЛУГ\n\nИсполнитель: ${data.fullName}\nПаспорт: серия ${data.passportSeries}, номер ${data.passportNumber}\nДата рождения: ${data.birthDate}\nАдрес: ${data.registrationAddress}\nИНН: ${data.inn}\nСНИЛС: ${data.snils}\nБанк: ${data.bankName}\nБИК: ${data.bik}\nКорреспондентский счёт: ${data.correspondentAccount || ''}\nРасчётный счёт: ${data.accountNumber}\n`;
    const blob = new Blob([documentText], { type: 'application/msword;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Договор_ГПХ_${data.fullName || 'подрядчик'}.doc`;
    link.click();
    URL.revokeObjectURL(link.href);
    created.textContent = 'Договор сформирован и скачан.';
  });
}
