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
  const formatDate = (value) => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return value || '';
    const [year, month, day] = value.split('-');
    return `${day}.${month}.${year}`;
  };
  const formatSnils = (value) => {
    const digits = String(value || '').replace(/\D/g, '');
    return digits.length === 11 ? `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)} ${digits.slice(9)}` : value || '';
  };
  const xmlEscape = (value) => String(value || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
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
          issueDate: formatDate(data.passportIssueDate), issuedBy: data.passportIssuedBy, birthDate: formatDate(data.birthDate),
          address: data.registrationAddress, inn: data.inn, snils: formatSnils(data.snils), phone: data.phone,
          email: data.email, bankName: data.bankName, bik: data.bik,
          correspondent: data.correspondentAccount || '', account: data.accountNumber
        };
        const replaceText = (from, to) => { xml = xml.replace(from, to); };
        const replaceNode = (text, content) => {
          const escaped = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          xml = xml.replace(new RegExp(`<w:t[^>]*>${escaped}</w:t>`), content);
        };
        replaceText('с одной стороны и _____________________________ ,', `с одной стороны и ${xmlEscape(values.fullName)} ,`);
        replaceText('________________________________________', xmlEscape(values.fullName));
        replaceNode('ФИО ______________________', `<w:t>ФИО ${xmlEscape(values.fullName)}</w:t>`);
        replaceNode('Паспорт: __________ когда выдан ___________, кем выдан ________________________', `<w:t>Паспорт: ${xmlEscape(values.passport)}; Дата выдачи: ${xmlEscape(values.issueDate)}; Кем выдан: ${xmlEscape(values.issuedBy)}</w:t>`);
        replaceNode('Дата рождения ______________', `<w:t>Дата рождения: ${xmlEscape(values.birthDate)}</w:t>`);
        replaceNode('Адрес: __________________', `<w:t>Адрес: ${xmlEscape(values.address)}</w:t>`);
        replaceNode('ИНН____________________', `<w:t>ИНН: ${xmlEscape(values.inn)}</w:t>`);
        replaceNode('СНИЛС____________________', `<w:t>СНИЛС: ${xmlEscape(values.snils)}</w:t>`);
        replaceText('<w:t>Телефон</w:t>', `<w:t>Телефон: ${xmlEscape(values.phone)}</w:t>`);
        replaceText('<w:t>e-</w:t>', `<w:t>e-mail: ${xmlEscape(values.email)}</w:t>`);
        xml = xml.replace(/<w:t>Телефон<\/w:t>/g, '').replace(/<w:t>mail<\/w:t>/g, '');
        replaceNode('Банковские реквизиты:', `<w:t>Банковские реквизиты:</w:t><w:br/><w:t>БИК: ${xmlEscape(values.bik)}</w:t><w:br/><w:t>Банк: ${xmlEscape(values.bankName)}</w:t><w:br/><w:t>к/с: ${xmlEscape(values.correspondent)}</w:t><w:br/><w:t>р/с: ${xmlEscape(values.account)}</w:t>`);
        const bankStart = xml.indexOf('<w:t>Банковские реквизиты:');
        const cellEnd = xml.indexOf('</w:tc>', bankStart);
        if (bankStart >= 0 && cellEnd > bankStart) {
          const before = xml.slice(0, bankStart);
          let removed = 0;
          const emptyParagraph = /<w:p\b[^>]*>(?:\s*<w:pPr[\s\S]*?<\/w:pPr>)?\s*<\/w:p>/g;
          const cell = xml.slice(bankStart, cellEnd).replace(emptyParagraph, (match) => removed++ < 5 ? '' : match);
          xml = before + cell + xml.slice(cellEnd);
        }
        const appendixIndex = xml.indexOf('<w:t>Приложение № 1</w:t>');
        if (appendixIndex >= 0) {
          const paragraphStart = xml.lastIndexOf('<w:p ', appendixIndex);
          const propertiesStart = xml.indexOf('<w:pPr', paragraphStart);
          const propertiesEnd = xml.indexOf('>', propertiesStart);
          if (paragraphStart >= 0 && propertiesStart > paragraphStart && propertiesEnd > propertiesStart) {
            xml = xml.slice(0, propertiesEnd + 1) + '<w:pageBreakBefore/>' + xml.slice(propertiesEnd + 1);
          }
        }
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
