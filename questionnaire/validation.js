function digits(value) {
  return value.replace(/\D/g, '');
}

function validateContractor(data) {
  const errors = [];
  const required = {
    lastName: 'Фамилия', firstName: 'Имя', middleName: 'Отчество', birthDate: 'Дата рождения', registrationAddress: 'Адрес регистрации', actualAddressSame: 'Совпадение фактического адреса с адресом регистрации',
    passportSeries: 'Серия паспорта', passportNumber: 'Номер паспорта',
    passportIssueDate: 'Дата выдачи паспорта', passportIssuedBy: 'Кем выдан паспорт',
    inn: 'ИНН', snils: 'СНИЛС', phone: 'Телефон', email: 'Электронная почта',
    bankName: 'Наименование банка', bik: 'БИК', accountNumber: 'Расчётный счёт',
    wasCivilServant: 'Сведения о государственной гражданской службе'
  };
  Object.entries(required).forEach(([key, label]) => {
    if (!String(data[key] || '').trim()) errors.push(`Заполните поле «${label}».`);
  });
  if (data.passportSeries && !/^\d{4}$/.test(data.passportSeries)) errors.push('Серия паспорта должна содержать 4 цифры.');
  if (data.passportNumber && !/^\d{6}$/.test(data.passportNumber)) errors.push('Номер паспорта должен содержать 6 цифр.');
  if (data.inn && !/^\d{12}$/.test(data.inn)) errors.push('ИНН должен содержать 12 цифр.');
  if (data.snils && !/^\d{11}$/.test(data.snils)) errors.push('СНИЛС должен содержать 11 цифр.');
  if (data.bik && !/^\d{9}$/.test(data.bik)) errors.push('БИК должен содержать 9 цифр.');
  if (data.accountNumber && !/^\d{20}$/.test(data.accountNumber)) errors.push('Расчётный счёт должен содержать 20 цифр.');
  if (data.correspondentAccount && !/^\d{20}$/.test(data.correspondentAccount)) errors.push('Корреспондентский счёт должен содержать 20 цифр.');
  if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) errors.push('Проверьте формат электронной почты.');
  if (data.wasCivilServant === 'Да' && !String(data.civilServiceDetails || '').trim()) errors.push('Укажите должность и наименование государственного органа.');
  if (data.actualAddressSame === 'Нет' && !String(data.actualAddress || '').trim()) errors.push('Укажите фактический адрес проживания.');
  return errors;
}

if (typeof module !== 'undefined') module.exports = { digits, validateContractor };
