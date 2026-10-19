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
        const replace = (pattern, value) => { xml = xml.replace(pattern, `$1${value}$2`); };
        replace(/(с одной стороны и )[_]{10,}( , именуемая)/, values.fullName);
        replace(/(>ФИО )[_]{5,}(<\/w:t>)/, values.fullName);
        replace(/(>Паспорт: )[^<]*(<\/w:t>)/, `серия ${data.passportSeries}, номер ${data.passportNumber}, дата выдачи ${data.passportIssueDate}, кем выдан ${data.passportIssuedBy}`);
        replace(/(>Дата рождения )[^<]*(<\/w:t>)/, values.birthDate);
        replace(/(>Адрес: )[^<]*(<\/w:t>)/, values.address);
        replace(/(>ИНН)[_]{5,}(<\/w:t>)/, `: ${values.inn}`);
        replace(/(>СНИЛС)[^<]*(<\/w:t>)/, `: ${values.snils} Телефон: ${values.phone} e-mail: ${values.email}`);
        replace(/(>Банковские реквизиты:)(<\/w:t>)/, ` БИК: ${values.bik}; Банк: ${values.bankName}; Корр. счёт: ${values.correspondent}; Расчётный счёт: ${values.account}`);
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
