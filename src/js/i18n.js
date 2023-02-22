let translations = {}

translations['en'] = {
  billingAddressRequired: 'Billing address is required',
  billingAddressStreet: 'Street',
  billingAddressHouseNumber: 'House Number',
  billingAddressCity: 'City',
  billingAddressZip: 'Zip',
  billingAddressState: 'State',
  billingAddressCountry: 'Country',
  billingAddressDistrict: 'District',
  billingAddressAdditional: 'Additional Information',
  pocketTypeRequired: 'Pocket Type is required',
  pocketTypeAmount: 'Amount',
  pocketTypeSelect: 'Pocket Type',
  pocketInstallments: 'Installments',
  pocketTypeAddLabel: 'Add Pocket',
}

translations['es'] = {
  billingAddressRequired: 'Se requiere la dirección de facturación',
  billingAddressStreet: 'Calle',
  billingAddressHouseNumber: 'Número de casa',
  billingAddressCity: 'Ciudad',
  billingAddressZip: 'Código postal',
  billingAddressState: 'Estado',
  billingAddressCountry: 'País',
  billingAddressDistrict: 'Distrito',
  billingAddressAdditional: 'Información adicional',
  pocketTypeRequired: 'Se requiere el tipo de bolsillo',
  pocketTypeAmount: 'Monto',
  pocketTypeSelect: 'Tipo de bolsillo',
  pocketInstallments: 'Cuotas',
  pocketTypeAddLabel: 'Agregar bolsillo',
}

translations['pt'] = {
  billingAddressRequired: 'Endereço de cobrança é obrigatório',
  billingAddressStreet: 'Rua',
  billingAddressHouseNumber: 'Número',
  billingAddressCity: 'Cidade',
  billingAddressZip: 'Código postal',
  billingAddressState: 'Estado',
  billingAddressCountry: 'País',
  billingAddressDistrict: 'Bairro',
  billingAddressAdditional: 'Complemento',
  pocketTypeRequired: 'Tipo de bolso é obrigatório',
  pocketTypeAmount: 'Valor',
  pocketTypeSelect: 'Tipo de bolso',
  pocketInstallments: 'Parcelas',
  pocketTypeAddLabel: 'Adicionar bolso',
}


class SDK_i18n {
  static get_label(locale, label) {
    const allowed_locales = ['en', 'es', 'pt']
    locale = !allowed_locales.includes(locale) ? 'en' : locale
    return translations[locale][label] || label
  }
}
