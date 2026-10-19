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
  const fullName = data.fullName || [data.lastName, data.firstName, data.middleName].filter(Boolean).join(' ');
  empty.hidden = true;
  application.hidden = false;
  document.querySelector('#name').textContent = fullName || 'Подрядчик';
  document.querySelector('#submitted').textContent = new Date().toLocaleString('ru-RU');
  document.querySelector('#create').addEventListener('click', () => {
    fetch('../templates/Шаблон%20ГПХ%20АНО.docx')
      .then((response) => response.arrayBuffer())
      .then((buffer) => JSZip.loadAsync(buffer))
      .then((zip) => zip.file('word/document.xml').async('string').then((xml) => ({ zip, xml })))
      .then(({ zip, xml }) => {
        const values = {
          fullName, passport: `серия ${data.passportSeries}, номер ${data.passportNumber}`,
          issueDate: data.passportIssueDate, issuedBy: data.passportIssuedBy, birthDate: data.birthDate,
          address: data.registrationAddress, inn: data.inn, snils: data.snils, phone: data.phone,
          email: data.email, bankName: data.bankName, bik: data.bik,
          correspondent: data.correspondentAccount || '', account: data.accountNumber
        };
        const replaceText = (from, to) => { xml = xml.replace(from, to); };
        replaceText('________________________________________', values.fullName);
        replaceText('ФИО ______________________', `ФИО ${values.fullName}`);
        replaceText('Паспорт: __________ когда выдан ___________, кем выдан ________________________', `Паспорт: серия ${data.passportSeries}, номер ${data.passportNumber}, дата выдачи ${data.passportIssueDate}, кем выдан ${data.passportIssuedBy}`);
        replaceText('Дата рождения ______________', `Дата рождения ${values.birthDate}`);
        replaceText('Адрес: __________________', `Адрес: ${values.address}`);
        replaceText('ИНН____________________', `ИНН${values.inn}`);
        replaceText('СНИЛС____________________', `СНИЛС${values.snils}`);
        replaceText('Телефон</w:t>', `Телефон: ${values.phone}</w:t>`);
        replaceText('e-mail</w:t>', `e-mail: ${values.email}</w:t>`);
        replaceText('Банковские реквизиты:</w:t>', `Банковские реквизиты: БИК: ${values.bik}; Банк: ${values.bankName}; Корр. счёт: ${values.correspondent}; Расчётный счёт: ${values.account}</w:t>`);
        zip.file('word/document.xml', xml);
        return zip.generateAsync({ type: 'blob' });
      })
      .then((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Договор_ГПХ_${fullName || 'подрядчик'}.docx`;
        link.click();
        URL.revokeObjectURL(link.href);
        created.textContent = 'Договор сформирован по шаблону и скачан.';
      })
      .catch(() => { created.textContent = 'Не удалось сформировать договор. Проверьте доступ к шаблону.'; });
  });
}
