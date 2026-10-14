const raw = localStorage.getItem('contractorQuestionnaire');
const empty = document.querySelector('#empty');
const application = document.querySelector('#application');
const created = document.querySelector('#created');

function utf16Le(text) {
  const bytes = new Uint8Array(2 + text.length * 2);
  bytes[0] = 0xff; bytes[1] = 0xfe;
  for (let i = 0; i < text.length; i += 1) {
    const code = text.charCodeAt(i);
    bytes[2 + i * 2] = code & 0xff;
    bytes[3 + i * 2] = code >> 8;
  }
  return bytes;
}

if (raw) {
  const data = JSON.parse(raw);
  empty.hidden = true;
  application.hidden = false;
  document.querySelector('#name').textContent = data.fullName || 'Подрядчик';
  document.querySelector('#submitted').textContent = new Date().toLocaleString('ru-RU');
  document.querySelector('#create').addEventListener('click', () => {
    const documentText = `ДОГОВОР ОКАЗАНИЯ УСЛУГ\n\nИсполнитель: ${data.fullName}\nПаспорт: серия ${data.passportSeries}, номер ${data.passportNumber}\nДата рождения: ${data.birthDate}\nАдрес: ${data.registrationAddress}\nИНН: ${data.inn}\nСНИЛС: ${data.snils}\nБанк: ${data.bankName}\nБИК: ${data.bik}\nКорреспондентский счёт: ${data.correspondentAccount || ''}\nРасчётный счёт: ${data.accountNumber}\n`;
    const blob = new Blob([utf16Le(documentText)], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Договор_ГПХ_${data.fullName || 'подрядчик'}.doc`;
    link.click();
    URL.revokeObjectURL(link.href);
    created.textContent = 'Договор сформирован и скачан.';
  });
}
