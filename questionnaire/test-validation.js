const assert = require('node:assert/strict');
const { validateContractor } = require('./validation');

const valid = {
  lastName: 'Иванов', firstName: 'Иван', middleName: 'Иванович', fullName: 'Иванов Иван Иванович', birthDate: '1990-01-01', registrationAddress: 'г. Пермь', actualAddress: 'г. Пермь',
  passportSeries: '1234', passportNumber: '123456', passportIssueDate: '2010-01-01', passportIssuedBy: 'УФМС',
  inn: '123456789012', snils: '12345678901', phone: '+79990000000', email: 'test@example.ru',
  bankName: 'Тестовый банк', bik: '123456789', accountNumber: '12345678901234567890', correspondentAccount: '',
  wasCivilServant: 'Нет', civilServiceDetails: ''
};
assert.deepEqual(validateContractor(valid), []);
assert.ok(validateContractor({ ...valid, inn: '123' }).some((e) => e.includes('ИНН')));
assert.ok(validateContractor({ ...valid, email: 'wrong' }).some((e) => e.includes('электронной почты')));
assert.ok(validateContractor({ ...valid, wasCivilServant: 'Да' }).some((e) => e.includes('государственного органа')));
console.log('Все тесты валидации пройдены.');
