PaymentForm.prototype.constructor = PaymentForm;

/**
 * @class PaymentForm
 *
 * @author Developer Team
 *
 * @param elem
 * @constructor
 */

function PaymentForm(elem) {
  this.elem = jQuery(elem);
  this.current_data = this.elem.children("div");
  this.card_brand_id = '';
  this.payment_method_type = null;
  this.numberBin = '';
  this.nip = '';
  this.USE_OTP = false;
  this.brand_name = '';
  this.isBlocked = false;
  this.useLunh = true;
  this.configuration = {};

  // Validate if its displaying in a mobile device
  this.IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  this.USE_VIRTUAL_KEYBOARD = !this.IS_MOBILE;

  this.locale = this.elem.data("locale") ? this.elem.data("locale") : "en";
  this.captureEmail = this.elem.data("capture-email") ? this.elem.data("capture-email") : false;
  this.captureCellPhone = this.elem.data("capture-cellphone") ? this.elem.data("capture-cellphone") : false;
  this.defaultCountryCode = this.elem.data("default-country") ? this.elem.data("default-country") : false;
  this.captureName = this.elem.data("capture-name") ? this.elem.data("capture-name") : false;
  this.iconColour = this.elem.data("icon-colour") ? this.elem.data("icon-colour") : false;
  this.EXPIRY_USE_DROPDOWNS = this.elem.data("use-dropdowns") ? this.elem.data("use-dropdowns") : false;
  this.exclusiveTypes = this.elem.data("exclusive-types") ? this.elem.data("exclusive-types").split(",") : false;
  this.invalidCardTypeMessage = this.elem.data("invalid-card-type-message") ? this.elem.data("invalid-card-type-message") : false;
  this.captureBillingAddress = this.elem.data("capture-billing-address") ? this.elem.data("capture-billing-address") : false;
  this.allowed_card_types = this.elem.data("allowed-card-types") ? this.elem.data("allowed-card-types").toString().split(",") : false;
  this.captureFiscalNumber = this.elem.data("capture-fiscal-number") ? this.elem.data("capture-fiscal-number") : false;

  // This is for support the first conf 'exclusive-types', try to delete in new version when nobody use it
  let allowed_card_brands_options = this.elem.data("exclusive-types") || this.elem.data("allowed-card-brands");
  this.allowed_card_brands = allowed_card_brands_options ? allowed_card_brands_options.split(",") : false;


  // initialize
  this.cvcLenght = 3;
  this.nipLenght = 4;
  this.verificationLenght = 6;
  this.initEmailInput();
  this.initCellPhoneInput();
  this.initNameInput();
  this.initCardNumberInput();
  this.initExpiryMonthInput();
  this.initExpiryYearInput();
  this.initCvcInput();
  this.initBillingAddress();
  if (this.captureFiscalNumber) {
    this.initFiscalNumberInput();
  }

  this.pocketTypes = {
    init: false,
    items: [],
    availableOptions: new Set([]),
    optionsType: {},
    configurationOptions: {},
    totalAmount: 0,
    totalPocketFieldsSum: 0,
    addButton: null,
    "options": [
      { 'code': 'CSD1', 'name': 'Cuota Monetaria' },
      { 'code': 'CSD2', 'name': 'Subsidio Escolar' },
      { 'code': 'CSD3', 'name': 'Bono Efectivo' },
      { 'code': 'CSD4', 'name': 'Ahorros' },
      { 'code': 'CSD5', 'name': 'Cupo Credito' },
      { 'code': 'CSD6', 'name': 'Bono Lonchera' },
      { 'code': 'CSD7', 'name': 'Bono Nacimiento' },
      { 'code': 'CSD8', 'name': 'Mundo Digital' },
      { 'code': 'CSD9', 'name': 'Adulto Mayor' },
      { 'code': 'CSD10', 'name': 'Subsidio Familiar' },
      { 'code': 'CSD11', 'name': 'Bolsillo Debito' },
    ]
  }

  this.elem.empty();

  // Setup display
  this.setupEmailInput();
  this.setupCellPhoneInput();
  this.setupNameInput();
  this.setupCardNumberInput();
  this.setupExpiryInput();
  this.setupCvcInput();
  this.setupBillingAddress();
  if (this.captureFiscalNumber) {
    this.setupFiscalNumberInput();
  }

  this.elem.append(this.current_data);

  // Set icon colour
  if (this.iconColour) {
    this.setIconColour(this.iconColour);
  }

  this.refreshCreditCardType();
  if (this.captureCellPhone) {
    this.refreshCellPhoneFormat();
    this.refreshCellphoneCountryCode();
  }
  if (this.billingAddressAdded()) this.refreshBillingAddressCountryFlag();
}

PaymentForm.KEYS = {
  "0": 48,
  "9": 57,
  "NUMPAD_0": 96,
  "NUMPAD_9": 105,
  "DELETE": 46,
  "BACKSPACE": 8,
  "ARROW_LEFT": 37,
  "ARROW_RIGHT": 39,
  "ARROW_UP": 38,
  "ARROW_DOWN": 40,
  "HOME": 36,
  "END": 35,
  "TAB": 9,
  "A": 65,
  "X": 88,
  "C": 67,
  "V": 86
};

PaymentForm.prototype.creditCardNumberMask = "XXXX XXXX XXXX XXXX";
PaymentForm.prototype.cvcMask = "XXX";
PaymentForm.EXPIRY_MASK = "XX / XX";
PaymentForm.CELLPHONE_MASK = "XXX XXX XXXX";
PaymentForm.CREDIT_CARD_NUMBER_PLACEHOLDER = "Número de tarjeta";
PaymentForm.NAME_PLACEHOLDER = "Nombre del titular";
PaymentForm.EMAIL_PLACEHOLDER = "E-mail";
PaymentForm.CELLPHONE_PLACEHOLDER = "Celular";
PaymentForm.FISCAL_NUMBER_PLACEHOLDER = "Documento de Identificación";
PaymentForm.EXPIRY_PLACEHOLDER = "MM / YY";
PaymentForm.EXPIRY_NUMBER_OF_YEARS = 30;
PaymentForm.AUTH_CVC = "AUTH_CVC";
PaymentForm.AUTH_NIP = "AUTH_NIP";
PaymentForm.AUTH_OTP = "AUTH_OTP";
PaymentForm.CVC_PLACEHOLDER = "CVC";
PaymentForm.NIP_PLACEHOLDER = "Clave Tuya";
PaymentForm.OTP_PLACEHOLDER_ADD = "No tengo o no recuerdo mi clave";
PaymentForm.OTP_PLACEHOLDER_CHECKOUT = "Continuar compra sin clave";
PaymentForm.OTP_EXPLICATION_ADD = "Escogiendo esta opción se va a generar una Clave Temporal única, con la que " +
  "validarás tu tarjeta. Haz clic en “Guardar” para continuar con el proceso.";
PaymentForm.OTP_EXPLICATION_CHECKOUT = "Escogiendo esta opción se va a generar una Clave Temporal única, con la " +
  "que validarás tu compra.";
PaymentForm.INVALID_CARD_TYPE_MESSAGE = "Tipo de tarjeta invalida para está operación.";
PaymentForm.VERIFICATION_PLACEHOLDER = "Código OTP";
PaymentForm.VERIFICATION_MESSAGE = "Esta operación requiere verificación";
PaymentForm.VERIFICATION_MESSAGE_2 = "OTP incorrecto, prueba nuevamente";

PaymentForm.CELLPHONE_SVG = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24px" height="17px" ' +
  'x="0px" y="0px" viewBox="0 0 27.442 27.442" style="enable-background:new 0 0 27.442 27.442;" ' +
  'xmlns:xlink="http://www.w3.org/1999/xlink"> <g> ' +
  '<path class="svg" d="M19.494,0H7.948C6.843,0,5.951,0.896,5.951,1.999v23.446c0,1.102,0.892,1.997,1.997,1.997h11.546' +
  'c1.103,0,1.997-0.895,1.997-1.997V1.999C21.491,0.896,20.597,0,19.494,0z M10.872,1.214h5.7c0.144,0,0.261,0.215,0.261' +
  ',0.481s-0.117,0.482-0.261,0.482h-5.7c-0.145,0-0.26-0.216-0.26-0.482C10.612,1.429,10.727,1.214,10.872,1.214z M13.72' +
  '2,25.469c-0.703,0-1.275-0.572-1.275-1.276s0.572-1.274,1.275-1.274c0.701,0,1.273,0.57,1.273,1.274S14.423,25.469,13.' +
  '722,25.469z M19.995,21.1H7.448V3.373h12.547V21.1z"/> </g> </svg>';

PaymentForm.CREDIT_CARD_SVG = '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" ' +
  'xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="3px" width="24px" height="17px" viewBox="0 0 216 146" ' +
  'enable-background="new 0 0 216 146" xml:space="preserve"> <g> <path class="svg" d="M182.385,14.258c-2.553-2.553-5.' +
  '621-3.829-9.205-3.829H42.821c-3.585,0-6.653,1.276-9.207,3.829c-2.553,2.553-3.829,5.621-3.829,9.206v99.071c0,3.585,' +
  '1.276,6.654,3.829,9.207c2.554,2.553,5.622,3.829,9.207,3.829H173.18c3.584,0,6.652-1.276,9.205-3.829s3.83-5.622,3.83' +
  '-9.207V23.464C186.215,19.879,184.938,16.811,182.385,14.258z M175.785,122.536c0,0.707-0.258,1.317-0.773,1.834c-0.51' +
  '6,0.515-1.127,0.772-1.832,0.772H42.821c-0.706,0-1.317-0.258-1.833-0.773c-0.516-0.518-0.774-1.127-0.774-1.834V73h13' +
  '5.571V122.536z M175.785,41.713H40.214v-18.25c0-0.706,0.257-1.316,0.774-1.833c0.516-0.515,1.127-0.773,1.833-0.773H1' +
  '73.18c0.705,0,1.316,0.257,1.832,0.773c0.516,0.517,0.773,1.127,0.773,1.833V41.713z"/> ' +
  '<rect class="svg" x="50.643" y="104.285" width="20.857" height="10.429"/> ' +
  '<rect class="svg" x="81.929" y="104.285" width="31.286" height="10.429"/> </g> </svg>';

PaymentForm.LOCK_SVG = '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" ' +
  'xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="3px" width="24px" height="17px" viewBox="0 0 216 146" ' +
  'enable-background="new 0 0 216 146" xml:space="preserve"> <path class="svg" d="M152.646,70.067c-1.521-1.521-3.367-' +
  '2.281-5.541-2.281H144.5V52.142c0-9.994-3.585-18.575-10.754-25.745c-7.17-7.17-15.751-10.755-25.746-10.755s-18.577,3' +
  '.585-25.746,10.755C75.084,33.567,71.5,42.148,71.5,52.142v15.644h-2.607c-2.172,0-4.019,0.76-5.54,2.281c-1.521,1.52-' +
  '2.281,3.367-2.281,5.541v46.929c0,2.172,0.76,4.019,2.281,5.54c1.521,1.52,3.368,2.281,5.54,2.281h78.214c2.174,0,4.02' +
  '-0.76,5.541-2.281c1.52-1.521,2.281-3.368,2.281-5.54V75.607C154.93,73.435,154.168,71.588,152.646,70.067z M128.857,6' +
  '7.786H87.143V52.142c0-5.757,2.037-10.673,6.111-14.746c4.074-4.074,8.989-6.11,14.747-6.11s10.673,2.036,14.746,6.11c' +
  '4.073,4.073,6.11,8.989,6.11,14.746V67.786z"/></svg>';

PaymentForm.CALENDAR_SVG = '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" ' +
  'xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="4px" width="24px" height="16px" viewBox="0 0 216 146" ' +
  'enable-background="new 0 0 216 146" xml:space="preserve"> <path class="svg" d="M172.691,23.953c-2.062-2.064-4.508-' +
  '3.096-7.332-3.096h-10.428v-7.822c0-3.584-1.277-6.653-3.83-9.206c-2.554-2.553-5.621-3.83-9.207-3.83h-5.213c-3.586,0' +
  '-6.654,1.277-9.207,3.83c-2.554,2.553-3.83,5.622-3.83,9.206v7.822H92.359v-7.822c0-3.584-1.277-6.653-3.83-9.206c-2.5' +
  '53-2.553-5.622-3.83-9.207-3.83h-5.214c-3.585,0-6.654,1.277-9.207,3.83c-2.553,2.553-3.83,5.622-3.83,9.206v7.822H50.' +
  '643c-2.825,0-5.269,1.032-7.333,3.096s-3.096,4.509-3.096,7.333v104.287c0,2.823,1.032,5.267,3.096,7.332c2.064,2.064,' +
  '4.508,3.096,7.333,3.096h114.714c2.824,0,5.27-1.032,7.332-3.096c2.064-2.064,3.096-4.509,3.096-7.332V31.286C175.785,' +
  '28.461,174.754,26.017,172.691,23.953z M134.073,13.036c0-0.761,0.243-1.386,0.731-1.874c0.488-0.488,1.113-0.733,1.87' +
  '5-0.733h5.213c0.762,0,1.385,0.244,1.875,0.733c0.488,0.489,0.732,1.114,0.732,1.874V36.5c0,0.761-0.244,1.385-0.732,1' +
  '.874c-0.49,0.488-1.113,0.733-1.875,0.733h-5.213c-0.762,0-1.387-0.244-1.875-0.733s-0.731-1.113-0.731-1.874V13.036z ' +
  'M71.501,13.036c0-0.761,0.244-1.386,0.733-1.874c0.489-0.488,1.113-0.733,1.874-0.733h5.214c0.761,0,1.386,0.244,1.874' +
  ',0.733c0.488,0.489,0.733,1.114,0.733,1.874V36.5c0,0.761-0.244,1.386-0.733,1.874c-0.489,0.488-1.113,0.733-1.874,0.7' +
  '33h-5.214c-0.761,0-1.386-0.244-1.874-0.733c-0.488-0.489-0.733-1.113-0.733-1.874V13.036z M165.357,135.572H50.643V52' +
  '.143h114.714V135.572z"/> </svg>';

PaymentForm.USER_SVG = '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" ' +
  'xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="4px" width="24px" height="16px" viewBox="0 0 216 146" ' +
  'enable-background="new 0 0 216 146" xml:space="preserve"> <g> <path class="svg" d="M107.999,73c8.638,0,16.011-3.05' +
  '6,22.12-9.166c6.111-6.11,9.166-13.483,9.166-22.12c0-8.636-3.055-16.009-9.166-22.12c-6.11-6.11-13.484-9.165-22.12-9' +
  '.165c-8.636,0-16.01,3.055-22.12,9.165c-6.111,6.111-9.166,13.484-9.166,22.12c0,8.637,3.055,16.01,9.166,22.12C91.99,' +
  '69.944,99.363,73,107.999,73z"/> <path class="svg" d="M165.07,106.037c-0.191-2.743-0.571-5.703-1.141-8.881c-0.57-3.' +
  '178-1.291-6.124-2.16-8.84c-0.869-2.715-2.037-5.363-3.504-7.943c-1.466-2.58-3.15-4.78-5.052-6.6s-4.223-3.272-6.965-' +
  '4.358c-2.744-1.086-5.772-1.63-9.085-1.63c-0.489,0-1.63,0.584-3.422,1.752s-3.815,2.472-6.069,3.911c-2.254,1.438-5.1' +
  '88,2.743-8.799,3.909c-3.612,1.168-7.237,1.752-10.877,1.752c-3.639,0-7.264-0.584-10.876-1.752c-3.611-1.166-6.545-2.' +
  '471-8.799-3.909c-2.254-1.439-4.277-2.743-6.069-3.911c-1.793-1.168-2.933-1.752-3.422-1.752c-3.313,0-6.341,0.544-9.0' +
  '84,1.63s-5.065,2.539-6.966,4.358c-1.901,1.82-3.585,4.02-5.051,6.6s-2.634,5.229-3.503,7.943c-0.869,2.716-1.589,5.66' +
  '2-2.159,8.84c-0.571,3.178-0.951,6.137-1.141,8.881c-0.19,2.744-0.285,5.554-0.285,8.433c0,6.517,1.983,11.664,5.948,1' +
  '5.439c3.965,3.774,9.234,5.661,15.806,5.661h71.208c6.572,0,11.84-1.887,15.806-5.661c3.966-3.775,5.948-8.921,5.948-1' +
  '5.439C165.357,111.591,165.262,108.78,165.07,106.037z"/> </g> </svg>';

PaymentForm.MAIL_SVG = '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" ' +
  'xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="4px" width="24px" height="16px" viewBox="0 0 216 146" ' +
  'enable-background="new 0 0 216 146" xml:space="preserve"> <path class="svg" d="M177.171,19.472c-2.553-2.553-5.622-' +
  '3.829-9.206-3.829H48.036c-3.585,0-6.654,1.276-9.207,3.829C36.276,22.025,35,25.094,35,28.679v88.644c0,3.585,1.276,6' +
  '.652,3.829,9.205c2.553,2.555,5.622,3.83,9.207,3.83h119.929c3.584,0,6.653-1.275,9.206-3.83c2.554-2.553,3.829-5.621,' +
  '3.829-9.205V28.679C181,25.094,179.725,22.025,177.171,19.472zM170.57,117.321c0,0.706-0.258,1.317-0.774,1.833s-1.127' +
  ',0.773-1.832,0.773H48.035c-0.706,0-1.317-0.257-1.833-0.773c-0.516-0.516-0.774-1.127-0.774-1.833V54.75c1.738,1.955,' +
  '3.612,3.748,5.622,5.377c14.557,11.189,26.126,20.368,34.708,27.538c2.77,2.336,5.024,4.155,6.762,5.459s4.087,2.62,7.' +
  '047,3.951s5.744,1.995,8.351,1.995H108h0.081c2.606,0,5.392-0.664,8.351-1.995c2.961-1.331,5.311-2.647,7.049-3.951c1.' +
  '737-1.304,3.992-3.123,6.762-5.459c8.582-7.17,20.15-16.349,34.707-27.538c2.01-1.629,3.885-3.422,5.621-5.377V117.321' +
  'z M170.57,30.797v0.896c0,3.204-1.262,6.776-3.787,10.713c-2.525,3.938-5.256,7.075-8.188,9.41c-10.484,8.257-21.373,1' +
  '6.865-32.672,25.827c-0.326,0.271-1.277,1.073-2.852,2.403c-1.574,1.331-2.824,2.351-3.748,3.056c-0.924,0.707-2.131,1' +
  '.562-3.625,2.566s-2.865,1.752-4.114,2.24s-2.417,0.732-3.503,0.732H108h-0.082c-1.086,0-2.253-0.244-3.503-0.732c-1.2' +
  '49-0.488-2.621-1.236-4.114-2.24c-1.493-1.004-2.702-1.859-3.625-2.566c-0.923-0.705-2.173-1.725-3.748-3.056c-1.575-1' +
  '.33-2.526-2.132-2.852-2.403c-11.297-8.962-22.187-17.57-32.67-25.827c-7.985-6.3-11.977-14.013-11.977-23.138c0-0.706' +
  ',0.258-1.317,0.774-1.833c0.516-0.516,1.127-0.774,1.833-0.774h119.929c0.434,0.244,0.814,0.312,1.141,0.204c0.326-0.1' +
  '1,0.57,0.094,0.732,0.61c0.163,0.516,0.312,0.76,0.448,0.733c0.136-0.027,0.218,0.312,0.245,1.019c0.025,0.706,0.039,1' +
  '.061,0.039,1.061V30.797z"/> </svg>';

PaymentForm.INFORMATION_SVG = '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" ' +
  'xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="4px" width="24px" height="16px" viewBox="0 0 216 146" ' +
  'enable-background="new 0 0 216 146" xml:space="preserve"> <g> <path class="svg" d="M97.571,41.714h20.859c1.411,0,2' +
  '.633-0.516,3.666-1.548c1.031-1.031,1.547-2.254,1.547-3.666V20.857c0-1.412-0.516-2.634-1.549-3.667c-1.031-1.031-2.2' +
  '54-1.548-3.666-1.548H97.571c-1.412,0-2.634,0.517-3.666,1.548c-1.032,1.032-1.548,2.255-1.548,3.667V36.5c0,1.412,0.5' +
  '16,2.635,1.548,3.666C94.937,41.198,96.159,41.714,97.571,41.714z"/><path class="svg" d="M132.523,111.048c-1.031-1.0' +
  '32-2.254-1.548-3.666-1.548h-5.215V62.571c0-1.412-0.516-2.634-1.547-3.666c-1.033-1.032-2.255-1.548-3.666-1.548H87.1' +
  '43c-1.412,0-2.634,0.516-3.666,1.548c-1.032,1.032-1.548,2.254-1.548,3.666V73c0,1.412,0.516,2.635,1.548,3.666c1.032,' +
  '1.032,2.254,1.548,3.666,1.548h5.215V109.5h-5.215c-1.412,0-2.634,0.516-3.666,1.548c-1.032,1.032-1.548,2.254-1.548,3' +
  '.666v10.429c0,1.412,0.516,2.635,1.548,3.668c1.032,1.03,2.254,1.547,3.666,1.547h41.714c1.412,0,2.634-0.517,3.666-1.' +
  '547c1.031-1.033,1.547-2.256,1.547-3.668v-10.429C134.07,113.302,133.557,112.08,132.523,111.048z"/> </g> </svg>';

PaymentForm.REMOVE_SVG = '<svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.75 9.875H6.25C5.85938 9.90104 5.65104 10.1094 5.625 10.5C5.65104 10.8906 5.85938 11.099 6.25 11.125H13.75C14.1406 11.099 14.349 10.8906 14.375 10.5C14.349 10.1094 14.1406 9.90104 13.75 9.875ZM10 0.5C8.125 0.526042 6.44531 0.981771 4.96094 1.86719C3.45052 2.7526 2.2526 3.95052 1.36719 5.46094C0.481771 6.94531 0.0260417 8.625 0 10.5C0.0260417 12.375 0.481771 14.0547 1.36719 15.5391C2.2526 17.0495 3.45052 18.2474 4.96094 19.1328C6.44531 20.0182 8.125 20.474 10 20.5C11.875 20.474 13.5547 20.0182 15.0391 19.1328C16.5495 18.2474 17.7474 17.0495 18.6328 15.5391C19.5182 14.0547 19.974 12.375 20 10.5C19.974 8.625 19.5182 6.94531 18.6328 5.46094C17.7474 3.95052 16.5495 2.7526 15.0391 1.86719C13.5547 0.981771 11.875 0.526042 10 0.5ZM10 19.25C8.38542 19.224 6.91406 18.8203 5.58594 18.0391C4.28385 17.2578 3.24219 16.2161 2.46094 14.9141C1.67969 13.5859 1.27604 12.1146 1.25 10.5C1.27604 8.88542 1.67969 7.41406 2.46094 6.08594C3.24219 4.78385 4.28385 3.74219 5.58594 2.96094C6.91406 2.17969 8.38542 1.77604 10 1.75C11.6146 1.77604 13.0859 2.17969 14.4141 2.96094C15.7161 3.74219 16.7578 4.78385 17.5391 6.08594C18.3203 7.41406 18.724 8.88542 18.75 10.5C18.724 12.1146 18.3203 13.5859 17.5391 14.9141C16.7578 16.2161 15.7161 17.2578 14.4141 18.0391C13.0859 18.8203 11.6146 19.224 10 19.25Z" fill="currentColor"/></svg>';

PaymentForm.ADD_SVG = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d = "M8 0C6.5 0.0208333 5.15625 0.385417 3.96875 1.09375C2.76042 1.80208 1.80208 2.76042 1.09375 3.96875C0.385417 5.15625 0.0208333 6.5 0 8C0.0208333 9.5 0.385417 10.8438 1.09375 12.0312C1.80208 13.2396 2.76042 14.1979 3.96875 14.9062C5.15625 15.6146 6.5 15.9792 8 16C9.5 15.9792 10.8438 15.6146 12.0312 14.9062C13.2396 14.1979 14.1979 13.2396 14.9062 12.0312C15.6146 10.8438 15.9792 9.5 16 8C15.9792 6.5 15.6146 5.15625 14.9062 3.96875C14.1979 2.76042 13.2396 1.80208 12.0312 1.09375C10.8438 0.385417 9.5 0.0208333 8 0ZM8 15C6.70833 14.9792 5.53125 14.6562 4.46875 14.0312C3.42708 13.4062 2.59375 12.5729 1.96875 11.5312C1.34375 10.4688 1.02083 9.29167 1 8C1.02083 6.70833 1.34375 5.53125 1.96875 4.46875C2.59375 3.42708 3.42708 2.59375 4.46875 1.96875C5.53125 1.34375 6.70833 1.02083 8 1C9.29167 1.02083 10.4688 1.34375 11.5312 1.96875C12.5729 2.59375 13.4062 3.42708 14.0312 4.46875C14.6562 5.53125 14.9792 6.70833 15 8C14.9792 9.29167 14.6562 10.4688 14.0312 11.5312C13.4062 12.5729 12.5729 13.4062 11.5312 14.0312C10.4688 14.6562 9.29167 14.9792 8 15ZM11 7.5H8.5V5C8.47917 4.6875 8.3125 4.52083 8 4.5C7.6875 4.52083 7.52083 4.6875 7.5 5V7.5H5C4.6875 7.52083 4.52083 7.6875 4.5 8C4.52083 8.3125 4.6875 8.47917 5 8.5H7.5V11C7.52083 11.3125 7.6875 11.4792 8 11.5C8.3125 11.4792 8.47917 11.3125 8.5 11V8.5H11C11.3125 8.47917 11.4792 8.3125 11.5 8C11.4792 7.6875 11.3125 7.52083 11 7.5Z" fill="currentColor" /></svg >'




/**
 * Get the key code from the given event.
 *
 * @param e
 * @returns {which|*|Object|which|which|string}
 */
PaymentForm.keyCodeFromEvent = function (e) {
  return e.which || e.keyCode;
};

/**
 * Get whether a command key (ctrl of mac cmd) is held down.
 *
 * @param e
 * @returns {boolean|metaKey|*|metaKey}
 */
PaymentForm.keyIsCommandFromEvent = function (e) {
  return e.ctrlKey || e.metaKey;
};

/**
 * Is the event a number key.
 *
 * @param e
 * @returns {boolean}
 */
PaymentForm.keyIsNumber = function (e) {
  return PaymentForm.keyIsTopNumber(e) || PaymentForm.keyIsKeypadNumber(e);
};

/**
 * Is the event a top keyboard number key.
 *
 * @param e
 * @returns {boolean}
 */
PaymentForm.keyIsTopNumber = function (e) {
  let keyCode = PaymentForm.keyCodeFromEvent(e);
  return keyCode >= PaymentForm.KEYS["0"] && keyCode <= PaymentForm.KEYS["9"];
};

/**
 * Is the event a keypad number key.
 *
 * @param e
 * @returns {boolean}
 */
PaymentForm.keyIsKeypadNumber = function (e) {
  let keyCode = PaymentForm.keyCodeFromEvent(e);
  return keyCode >= PaymentForm.KEYS["NUMPAD_0"] && keyCode <= PaymentForm.KEYS["NUMPAD_9"];
};

/**
 * Is the event a delete key.
 *
 * @param e
 * @returns {boolean}
 */
PaymentForm.keyIsDelete = function (e) {
  return PaymentForm.keyCodeFromEvent(e) === PaymentForm.KEYS["DELETE"];
};

/**
 * Is the event a backspace key.
 *
 * @param e
 * @returns {boolean}
 */
PaymentForm.keyIsBackspace = function (e) {
  return PaymentForm.keyCodeFromEvent(e) === PaymentForm.KEYS["BACKSPACE"];
};

/**
 * Is the event a deletion key (delete or backspace)
 *
 * @param e
 * @returns {boolean}
 */
PaymentForm.keyIsDeletion = function (e) {
  return PaymentForm.keyIsDelete(e) || PaymentForm.keyIsBackspace(e);
};

/**
 * Is the event an arrow key.
 *
 * @param e
 * @returns {boolean}
 */
PaymentForm.keyIsArrow = function (e) {
  let keyCode = PaymentForm.keyCodeFromEvent(e);
  return keyCode >= PaymentForm.KEYS["ARROW_LEFT"] && keyCode <= PaymentForm.KEYS["ARROW_DOWN"];
};

/**
 * Is the event a navigation key.
 *
 * @param e
 * @returns {boolean}
 */
PaymentForm.keyIsNavigation = function (e) {
  let keyCode = PaymentForm.keyCodeFromEvent(e);
  return keyCode === PaymentForm.KEYS["HOME"] || keyCode === PaymentForm.KEYS["END"];
};

/**
 * Is the event a keyboard command (copy, paste, cut, highlight all)
 *
 * @param e
 * @returns {boolean|metaKey|*|metaKey|boolean}
 */
PaymentForm.keyIsKeyboardCommand = function (e) {
  let keyCode = PaymentForm.keyCodeFromEvent(e);
  return PaymentForm.keyIsCommandFromEvent(e) &&
    (
      keyCode === PaymentForm.KEYS["A"] ||
      keyCode === PaymentForm.KEYS["X"] ||
      keyCode === PaymentForm.KEYS["C"] ||
      keyCode === PaymentForm.KEYS["V"]
    );
};

/**
 * Is the event the tab key?
 *
 * @param e
 * @returns {boolean}
 */
PaymentForm.keyIsTab = function (e) {
  return PaymentForm.keyCodeFromEvent(e) === PaymentForm.KEYS["TAB"];
};

/**
 * Copy all attributes of the source element to the destination element.
 *
 * @param source
 * @param destination
 */
PaymentForm.copyAllElementAttributes = function (source, destination) {
  $.each(source[0].attributes, function (idx, attr) {
    destination.attr(attr.nodeName, attr.nodeValue);
  });
};

/**
 * Strip all characters that are not in the range 0-9
 *
 * @param string
 * @returns {string}
 */
PaymentForm.numbersOnlyString = function (string) {
  let numbersOnlyString = "";
  for (let i = 0; i < string.length; i++) {
    let currentChar = string.charAt(i);
    let isValid = !isNaN(parseInt(currentChar));
    if (isValid) {
      numbersOnlyString += currentChar;
    }
  }
  return numbersOnlyString;
};

/**
 * Apply a format mask to the given string
 *
 * @param string
 * @param mask
 * @returns {string}
 */
PaymentForm.applyFormatMask = function (string, mask) {
  let formattedString = "";
  let numberPos = 0;
  for (let j = 0; j < mask.length; j++) {
    let currentMaskChar = mask[j];
    if (currentMaskChar === "X") {
      let digit = string.charAt(numberPos);
      if (!digit) {
        break;
      }
      formattedString += string.charAt(numberPos);
      numberPos++;
    } else {
      formattedString += currentMaskChar;
    }
  }
  return formattedString;
};

/**
 * @param {String} label
 * @return String
 */
PaymentForm.prototype.__ = function (label) {
  return SDK_i18n.get_label(this.locale, label);
}

PaymentForm.prototype.showVerification = function (objResponse, successCallback, errorCallback) {
  this.addCardProcess = {
    response: objResponse,
    successAddCardCallback: successCallback,
    errorAddCardCallback: errorCallback,
  };
  this.invalidCardTypeMessage = PaymentForm.VERIFICATION_MESSAGE !== this.invalidCardTypeMessage ? PaymentForm.VERIFICATION_MESSAGE : PaymentForm.VERIFICATION_MESSAGE_2;
  this.addWarningMessage();
  this.addVerificationContainer();
};

PaymentForm.prototype.verifyTransaction = function () {
  this.blockVerificationContainer();
  let user_id = this.addCardProcess.response.user.id;
  let transaction_id = this.addCardProcess.response.card.transaction_reference;
  let verification_type = 'BY_OTP';  // TODO: Dynamic, according to the message in the answer
  let value = this.getVerificationValue();

  let $this = this;
  Payment.verifyTransaction(
    user_id,
    transaction_id,
    verification_type,
    value,
    function (response) {
      $this.unBlockVerificationContainer();
      $this.removeVerificationContainer();
      $this.addCardProcess.response.transaction = $this.addCardProcess.response.transaction ? response.transaction : undefined;
      if (response.transaction.status === 'pending') {
        return $this.showVerification(
          $this.addCardProcess.response,
          $this.addCardProcess.successAddCardCallback,
          $this.addCardProcess.errorAddCardCallback
        )
      } else if (response.transaction.status === 'success') {
        $this.addCardProcess.response.card.status = 'valid';
      } else {
        $this.addCardProcess.response.card.status = 'rejected';
        $this.addCardProcess.response.card.message = response.transaction.message;
      }
      $this.addCardProcess.successAddCardCallback($this.addCardProcess.response);
    },
    function (response) {
      $this.unBlockVerificationContainer();
      $this.removeVerificationContainer();
      $this.addCardProcess.errorAddCardCallback($this.addCardProcess.response);
    });
};



PaymentForm.prototype.cardTypeFromNumberBin = function (number) {
  let number_bin = number.replace(" ", "").substring(0, 6);
  if (number >= 6 && this.numberBin !== number_bin) {
    this.numberBin = number_bin;
    const $this = this;
    Payment.getBinInformation(number_bin, this, this.successBinCallback, function (error) {
      const { error: { description } } = error;
      const constErrorText = description == "session has expired"
        ? "El token ha caducado, recargue este formulario."
        : description;
      $this.invalidCardTypeMessage = constErrorText;
      $this.addWarningMessage();
      if ($(".payment-button-popup").length > 0) {
        $(".payment-button-popup").attr("disabled", true);
      }
    });
  }
};

PaymentForm.prototype.setRequiredFields = function (required_fields) {
  const form = this;
  if (!(required_fields && required_fields.length > 0)) {
    if (!this.captureFiscalNumber) {
      form.removeFiscalNumber();
    }
    form.removeNip();
    form.removePocketType();
    return
  }

  required_fields.forEach(function (required_field) {
    let field_name = typeof (required_field) === 'object' ? Object.keys(required_field)[0] : required_field;

    // Only should be contemplated the no default fields from SDK form (fiscal_number, tuya_key, fiscal_number_type)
    switch (field_name) {
      case 'fiscal_number':
        form.addFiscalNumber();
        break;
      case 'tuya_key':
        form.addNip();
        break;
      case 'fiscal_number_type':
        break;
      case 'pocket_type':
        form.addPocketType();
        break;
    }
  }
  );
};

PaymentForm.prototype.setNoRequiredFields = function (no_required_fields) {
  const form = this;

  if (!(no_required_fields && no_required_fields.length > 0)) {
    form.addExpiryContainer();
    form.addCvcContainer();
    return
  }

  no_required_fields.forEach(function (no_required_field) {
    let field_name = typeof (no_required_field) === 'object' ? Object.keys(no_required_field)[0] : no_required_field;

    // Only should be contemplated the default fields from SDK form (expiration_date, cvv)
    switch (field_name) {
      case 'expiration_date':
        form.removeExpiryContainer();
        break;
      case 'cvv':
        form.removeCvcContainer();
        break;
    }
  }
  );
};

PaymentForm.prototype.successBinCallback = function (objResponse, form) {
  // Set luhn flag
  form.useLunh = objResponse.use_luhn;

  // Set card type
  form.card_brand_id = objResponse.card_type.length > 0 ? objResponse.card_type : '';
  form.payment_method_type = objResponse.payment_method_type;
  form.brand_name = objResponse.brand_name.length > 0 ? objResponse.brand_name : '';

  // Set card type icon
  $(".card-type-icon").css("background-image", "url(" + objResponse.url_logo + ")");

  // Set card mask
  form.creditCardNumberMask = objResponse.card_mask ? objResponse.card_mask : "XXXX XXXX XXXX XXXX";
  form.cardNumberInput.attr("maxlength", form.creditCardNumberMask.length);

  // Set cvc lenght and cvc mask
  form.cvcLenght = objResponse.cvv_length;
  form.cvcInput.attr("maxlength", form.cvcLenght);
  form.cvcMask = "X".repeat(form.cvcLenght);

  // Set installment options
  if (objResponse.installments_options && objResponse.installments_options.length > 0) {
    form.setInstallmentsOptions(objResponse.installments_options);
  }

  // Set use of otp
  form.USE_OTP = objResponse.otp;

  // Set configurations
  form.configuration = objResponse.configuration;

  // Validate required fields for bin
  form.setRequiredFields(objResponse.required_fields);

  // Validate not required fields for bin
  form.setNoRequiredFields(objResponse.no_required_fields);

  // Validate if card brand is valid.
  let valid_brand_id = true;
  if (form.allowed_card_brands) {
    valid_brand_id = false;
    form.allowed_card_brands.forEach(function (brand_id) {
      if (form.card_brand_id === brand_id) {
        valid_brand_id = true;
      }
    });
  }

  // Validate if card type is valid.
  let valid_payment_method_type = true;
  if (form.allowed_card_types) {
    valid_payment_method_type = false;
    form.allowed_card_types.forEach(function (type) {
      if (form.payment_method_type === parseInt(type)) {
        valid_payment_method_type = true;
      }
    });
  }

  let valid_card = valid_brand_id && valid_payment_method_type
  if (!valid_card) {
    form.blockForm();
  } else if (valid_card && form.isBlocked) {
    form.unBlockForm();
  }

};

/**
 * Set the installments if this exists
 *
 * @param installments - array
 */
PaymentForm.prototype.setInstallmentsOptions = function (installments, selectedInstallment = null, isDefaultText = true) {
  const selectInstallments = selectedInstallment || $(".installments");
  selectInstallments.empty();
  installments.forEach(function (value, index) {
    const isInitialIndex = index === 0;
    const text = isInitialIndex
      ? isDefaultText
        ? this.__('installments')
        : value
      : value;
    selectInstallments.append($("<option>").attr("value", value).text(text));
  }, this);
};

/**
 * Get the caret start position of the given element.
 *
 * @param element
 * @returns {*}
 */
PaymentForm.caretStartPosition = function (element) {
  if (typeof element.selectionStart == "number") {
    return element.selectionStart;
  }
  return false;
};

/**
 * Gte the caret end position of the given element.
 *
 * @param element
 * @returns {*}
 */
PaymentForm.caretEndPosition = function (element) {
  if (typeof element.selectionEnd == "number") {
    return element.selectionEnd;
  }
  return false;
};

/**
 * Set the caret position of the given element.
 *
 * @param element
 * @param caretPos
 */
PaymentForm.setCaretPosition = function (element, caretPos) {
  if (element != null) {
    if (element.createTextRange) {
      let range = element.createTextRange();
      range.move('character', caretPos);
      range.select();
    } else {
      if (element.selectionStart) {
        element.focus();
        element.setSelectionRange(caretPos, caretPos);
      } else {
        element.focus();
      }
    }
  }
};

/**
 * Normalise the caret position for the given mask.
 *
 * @param mask
 * @param caretPosition
 * @returns {number}
 */
PaymentForm.normaliseCaretPosition = function (mask, caretPosition) {
  let numberPos = 0;
  if (caretPosition < 0 || caretPosition > mask.length) {
    return 0;
  }
  for (let i = 0; i < mask.length; i++) {
    if (i === caretPosition) {
      return numberPos;
    }
    if (mask[i] === "X") {
      numberPos++;
    }
  }
  return numberPos;
};

/**
 * Denormalise the caret position for the given mask.
 *
 * @param mask
 * @param caretPosition
 * @returns {*}
 */
PaymentForm.denormaliseCaretPosition = function (mask, caretPosition) {
  let numberPos = 0;
  if (caretPosition < 0 || caretPosition > mask.length) {
    return 0;
  }
  for (let i = 0; i < mask.length; i++) {
    if (numberPos === caretPosition) {
      return i;
    }
    if (mask[i] === "X") {
      numberPos++;
    }
  }
  return mask.length;
};

/**
 *
 *
 * @param e
 */
PaymentForm.filterNumberOnlyKey = function (e) {
  let isNumber = PaymentForm.keyIsNumber(e);
  let isDeletion = PaymentForm.keyIsDeletion(e);
  let isArrow = PaymentForm.keyIsArrow(e);
  let isNavigation = PaymentForm.keyIsNavigation(e);
  let isKeyboardCommand = PaymentForm.keyIsKeyboardCommand(e);
  let isTab = PaymentForm.keyIsTab(e);

  if (!isNumber && !isDeletion && !isArrow && !isNavigation && !isKeyboardCommand && !isTab) {
    e.preventDefault();
  }
};

/**
 *
 *
 * @param keyCode
 * @returns {*}
 */
PaymentForm.digitFromKeyCode = function (keyCode) {

  if (keyCode >= PaymentForm.KEYS["0"] && keyCode <= PaymentForm.KEYS["9"]) {
    return keyCode - PaymentForm.KEYS["0"];
  }

  if (keyCode >= PaymentForm.KEYS["NUMPAD_0"] && keyCode <= PaymentForm.KEYS["NUMPAD_9"]) {
    return keyCode - PaymentForm.KEYS["NUMPAD_0"];
  }

  return null;
};

/**
 *
 *
 * @param e
 * @param mask
 */
PaymentForm.handleMaskedNumberInputKey = function (e, mask) {
  PaymentForm.filterNumberOnlyKey(e);

  let keyCode = e.which || e.keyCode;

  let element = e.target;

  let caretStart = PaymentForm.caretStartPosition(element);
  let caretEnd = PaymentForm.caretEndPosition(element);

  // Calculate normalised caret position
  let normalisedStartCaretPosition = PaymentForm.normaliseCaretPosition(mask, caretStart);
  let normalisedEndCaretPosition = PaymentForm.normaliseCaretPosition(mask, caretEnd);

  let newCaretPosition = caretStart;

  let isNumber = PaymentForm.keyIsNumber(e);
  let isDelete = PaymentForm.keyIsDelete(e);
  let isBackspace = PaymentForm.keyIsBackspace(e);

  if (isNumber || isDelete || isBackspace) {
    e.preventDefault();
    let rawText = $(element).val();
    let numbersOnly = PaymentForm.numbersOnlyString(rawText);

    let digit = PaymentForm.digitFromKeyCode(keyCode);

    let rangeHighlighted = normalisedEndCaretPosition > normalisedStartCaretPosition;

    // Remove values highlighted (if highlighted)
    if (rangeHighlighted) {
      numbersOnly = (numbersOnly.slice(0, normalisedStartCaretPosition) +
        numbersOnly.slice(normalisedEndCaretPosition));
    }

    // Forward Action
    if (caretStart !== mask.length) {

      // Insert number digit
      if (isNumber && rawText.length <= mask.length) {
        numbersOnly = (numbersOnly.slice(0, normalisedStartCaretPosition) + digit +
          numbersOnly.slice(normalisedStartCaretPosition));
        newCaretPosition = Math.max(
          PaymentForm.denormaliseCaretPosition(mask, normalisedStartCaretPosition + 1),
          PaymentForm.denormaliseCaretPosition(mask, normalisedStartCaretPosition + 2) - 1
        );
      }

      // Delete
      if (isDelete) {
        numbersOnly = (numbersOnly.slice(0, normalisedStartCaretPosition) +
          numbersOnly.slice(normalisedStartCaretPosition + 1));
      }

    }

    // Backward Action
    if (caretStart !== 0) {

      // Backspace
      if (isBackspace && !rangeHighlighted) {
        numbersOnly = (numbersOnly.slice(0, normalisedStartCaretPosition - 1) +
          numbersOnly.slice(normalisedStartCaretPosition));
        newCaretPosition = PaymentForm.denormaliseCaretPosition(mask, normalisedStartCaretPosition - 1);
      }
    }

    $(element).val(PaymentForm.applyFormatMask(numbersOnly, mask));

    PaymentForm.setCaretPosition(element, newCaretPosition);
  }
};

/**
 * Generate a random array to assign to tuya keyboard
 */
PaymentForm.generateRandoms = function () {
  let myArray = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let i, j, k;
  for (i = myArray.length; i; i--) {
    j = Math.floor(Math.random() * i);
    k = myArray[i - 1];
    myArray[i - 1] = myArray[j];
    myArray[j] = k;
  }
  return myArray;
};

/**
 * Get the card number inputted.
 *
 * @returns {string}
 */
PaymentForm.prototype.getCardNumber = function () {
  return this.cardNumberInput.val();
};

PaymentForm.prototype.isValidBillingAddress = function () {
  if (!this.captureBillingAddress) return true
  let iv_country = this.refreshBillingAddressCountryValidation();
  let iv_state = this.refreshBillingAddressStateValidation();
  let iv_city = this.refreshBillingAddressCityValidation();
  let iv_district = this.refreshBillingAddressDistrictValidation();
  let iv_zip = this.refreshBillingAddressZipValidation();
  let iv_street = this.refreshBillingAddressStreetValidation();
  let iv_housenumber = this.refreshBillingAddressHouseNumberValidation();
  let iv_additional = this.refreshBillingAddressAdditionalValidation();
  return iv_country && iv_state && iv_city && iv_district && iv_zip && iv_street && iv_housenumber && iv_additional;
}

PaymentForm.prototype.isPocketTypeValid = function () {
  const { configuration: { colsubsidio: { type_pockets } = {} } = {} } = this;
  if (!this.isPocketTypeAdded() && !type_pockets) return true;
  const validationArray = new Array();
  this.pocketTypes.items.forEach((item, index) => {
    validationArray.push(this.refreshPocketTypeAmountValidation(index));
    validationArray.push(this.refreshPocketTypeSelectValidation(index));
    validationArray.push(this.refreshPocketTypeInstallmentsValidation(index));
  });
  if (validationArray.length === 0) return false;
  const isValid = !validationArray.includes(false);
  if (isValid) {
    this.updatePocketsLabel({ type: "globalValidation" });
  };
  return isValid;
};

/**
 * Is the given data a valid card?
 *
 * @returns {boolean}
 */
PaymentForm.prototype.isValidData = function () {
  let is_date_valid = this.refreshExpiryMonthValidation();
  let is_cvc_valid = this.refreshCvcValidation();
  let is_card_holder_valid = this.refreshCardHolderNameValidation();
  let is_email_valid = this.refreshEmailValidation();
  let is_cellphone_valid = this.refreshCellPhoneValidation();
  let is_card_number_valid = this.refreshCardNumberValidation();
  let is_fiscal_number_valid = this.refreshFiscalNumberValidation();
  let is_nip_valid = this.refreshNipValidation();
  let is_valid_billing_address = this.isValidBillingAddress();
  let is_valid_pocket_type = this.isPocketTypeValid();
  return is_date_valid && is_cvc_valid && is_card_holder_valid && is_card_number_valid
    && is_email_valid && is_cellphone_valid && is_fiscal_number_valid && is_nip_valid
    && is_valid_billing_address && is_valid_pocket_type;
};

PaymentForm.prototype.refreshCvcValidation = function () {
  if (this.isCvcValid()) {
    this.cvcInput.parent().removeClass("has-error");
    return true;
  } else {
    this.cvcInput.parent().addClass("has-error");
    return false;
  }
};

PaymentForm.prototype.refreshCardHolderNameValidation = function () {
  if (this.isCardHolderNameValid()) {
    this.nameInput.parent().removeClass("has-error");
    return true;
  } else {
    this.nameInput.parent().addClass("has-error");
    return false;
  }
};

PaymentForm.prototype.refreshEmailValidation = function () {
  if (this.isEmailValid()) {
    this.emailInput.parent().removeClass("has-error");
    return true;
  } else {
    this.emailInput.parent().addClass("has-error");
    return false;
  }
};

PaymentForm.prototype.refreshCellPhoneValidation = function () {
  if (this.isCellPhoneValid()) {
    this.cellPhoneInput.parent().removeClass("has-error");
    return true;
  } else {
    this.cellPhoneInput.parent().addClass("has-error");
    return false;
  }
};

PaymentForm.prototype.refreshCardNumberValidation = function () {
  if (this.isCardNumberValid()) {
    this.cardNumberInput.parent().removeClass("has-error");
    return true;
  } else {
    this.cardNumberInput.parent().addClass("has-error");
    return false;
  }
};

PaymentForm.prototype.refreshFiscalNumberValidation = function () {
  if (this.fiscalNumberAdded() && this.isFiscalNumberValid()) {
    this.fiscalNumberInput.parent().removeClass("has-error");
    return true;
  } else if (this.fiscalNumberAdded() && !this.isFiscalNumberValid()) {
    this.fiscalNumberInput.parent().addClass("has-error");
    return false;
  } else {
    return true;
  }
};

PaymentForm.prototype.refreshNipValidation = function () {
  if (this.nipWrapperAdded()) {
    if (this.isNipValid()) {
      this.nipInput.parent().removeClass("has-error");
      return true;
    } else {
      this.nipInput.parent().addClass("has-error");
      return false;
    }
  } else {
    return true
  }
};

PaymentForm.prototype.refreshValidationOption = function () {
  if (this.getValidationOption() === PaymentForm.AUTH_OTP) {
    this.addValidationMessage();
    this.removeNip();
    this.removeVirtualKeyboard();
  } else if (this.getValidationOption() === PaymentForm.AUTH_NIP) {
    this.removeValidationMessage();
    this.addNip();
  }
};

PaymentForm.prototype.refreshVerificationInputValidation = function () {
  if (this.isVerificationValueValid()) {
    this.verificationInput.parent().removeClass("has-error");
    this.verificationBtn.removeAttr('disabled');
    return true;
  } else {
    this.verificationInput.parent().addClass("has-error");
    this.verificationBtn.attr('disabled', 'disabled');
    return false;
  }
};

PaymentForm.prototype.refreshBillingAddressCountryValidation = function () {
  let valid = this.isBillingAddressCountryValid()
  valid ? this.billingAddressCountry.removeClass("has-error") : this.billingAddressCountry.addClass("has-error");
  return valid
};

PaymentForm.prototype.refreshBillingAddressStateValidation = function () {
  let valid = this.isBillingAddressStateValid()
  valid ? this.billingAddressState.removeClass("has-error") : this.billingAddressState.addClass("has-error");
  return valid
};

PaymentForm.prototype.refreshBillingAddressCityValidation = function () {
  let valid = this.isBillingAddressCityValid();
  valid ? this.billingAddressCity.removeClass("has-error") : this.billingAddressCity.addClass("has-error");
  return valid
};

PaymentForm.prototype.refreshBillingAddressDistrictValidation = function () {
  let valid = this.isBillingAddressDistrictValid();
  valid ? this.billingAddressDistrict.removeClass("has-error") : this.billingAddressDistrict.addClass("has-error");
  return valid
};

PaymentForm.prototype.refreshBillingAddressZipValidation = function () {
  let valid = this.isBillingAddressZipValid();
  valid ? this.billingAddressZip.removeClass("has-error") : this.billingAddressZip.addClass("has-error");
  return valid
};

PaymentForm.prototype.refreshBillingAddressStreetValidation = function () {
  let valid = this.isBillingAddressStreetValid();
  valid ? this.billingAddressStreet.removeClass("has-error") : this.billingAddressStreet.addClass("has-error");
  return valid
};

PaymentForm.prototype.refreshBillingAddressHouseNumberValidation = function () {
  let valid = this.isBillingAddressHouseNumberValid();
  valid ? this.billingAddressHouseNumber.removeClass("has-error") : this.billingAddressHouseNumber.addClass("has-error");
  return valid
};

PaymentForm.prototype.refreshBillingAddressAdditionalValidation = function () {
  let valid = this.isBillingAddressAdditionalValid();
  valid ? this.billingAddressAdditional.removeClass("has-error") : this.billingAddressAdditional.addClass("has-error");
  return valid
};

PaymentForm.prototype.refreshPocketTypeAmountValidation = function (index) {
  const cAmountField = this.pocketTypes.items[index].amount;
  let valid = this.isPocketTypeAmountValid(index);
  valid ? cAmountField.removeClass("has-error") : cAmountField.addClass("has-error");
  this.updatePocketsLabel({ type: "validate" });
  return valid
};

PaymentForm.prototype.refreshPocketTypeSelectValidation = function (index) {
  let valid = this.isPocketTypeSelectValid(index);
  return valid
};

PaymentForm.prototype.refreshPocketTypeInstallmentsValidation = function (index) {
  const cInstallmentsField = this.pocketTypes.items[index].installments;
  let valid = this.isPocketTypeInstallmentsValid(index);
  valid ? cInstallmentsField.removeClass("has-error") : cInstallmentsField.addClass("has-error");
  return valid
};




//======================================================================================================

PaymentForm.prototype.addValueToNip = function (value, key) {
  if (this.nipWrapperAdded()) {
    if (this.nipInput.val().length < this.nipLenght) {
      let newValue = this.nipInput.val() + value;
      this.nipInput.val(newValue);
      this.nip = this.nip + key;
    }
  }
};

PaymentForm.prototype.cleanNipInput = function () {
  if (this.nipWrapperAdded())
    this.nipInput.val("");
  this.nip = "";
};

/**
 * Is the given input a valid cvc?
 *
 * @returns {boolean}
 */
PaymentForm.prototype.isCvcValid = function () {
  if (this.getValidationOption() === PaymentForm.AUTH_CVC) {
    return this.getCvc() != null && this.getCvc().trim().length === this.cvcLenght;
  } else {
    return true;
  }
};

/**
 * Is the given input a valid CardHolderName?
 *
 * @returns {boolean}
 */
PaymentForm.prototype.isCardHolderNameValid = function () {
  if (this.captureName)
    return this.getName() != null && this.getName().length >= 5;
  else
    return true;
};

PaymentForm.prototype.isEmailValid = function () {
  if (this.captureEmail) {
    let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return this.getEmail() != null && this.getEmail().length >= 5 && re.test(this.getEmail());
  } else
    return true;
};

PaymentForm.prototype.isCellPhoneValid = function () {
  if (this.captureCellPhone)
    return this.getCellPhone() != null && this.getCellPhone().length >= 7;
  else
    return true;
};

/**
 * Is the given input a valid Card Number?
 *
 * @returns {boolean}
 */
PaymentForm.prototype.isCardNumberValid = function () {
  let value = this.getCardNumber();
  if (!this.useLunh) return true;
  if (value === '') return false;
  if (/[^0-9-\s]+/.test(value)) return false;

  // The Luhn Algorithm. It's so pretty.
  let nCheck = 0, nDigit = 0, bEven = false;
  value = value.replace(/\D/g, "");

  for (let n = value.length - 1; n >= 0; n--) {
    let cDigit = value.charAt(n),
      nDigit = parseInt(cDigit, 10);

    if (bEven) {
      if ((nDigit *= 2) > 9) nDigit -= 9;
    }

    nCheck += nDigit;
    bEven = !bEven;
  }

  return (nCheck % 10) === 0;
};

/**
 * Is the given input a valid nip?
 *
 * @returns {boolean}
 */
PaymentForm.prototype.isNipValid = function () {
  if (this.getValidationOption() === PaymentForm.AUTH_NIP) {
    return this.getNip() != null && this.getNip().trim().length === this.nipLenght;
  } else {
    return true;
  }
};

/**
 * Is the given input a valid FiscalNumber?
 *
 * @returns {boolean}
 */
PaymentForm.prototype.isFiscalNumberValid = function () {
  if (this.fiscalNumberAdded() || this.captureFiscalNumber)
    return this.getFiscalNumber() != null && this.getFiscalNumber().length >= 6;
  else
    return true
};

/**
 * Is the given input a valid verification?
 *
 * @returns {boolean}
 */
PaymentForm.prototype.isVerificationValueValid = function () {
  if (this.verificationContainerAdded()) {
    return this.getVerificationValue() != null && this.getVerificationValue().trim().length === this.verificationLenght;
  } else {
    return true;
  }
};

PaymentForm.prototype.isBillingAddressCountryValid = function () {
  if (!this.captureBillingAddress) return true
  let value = this.getBillingAddressCountry();
  return value !== null && value.length === 3;
};

PaymentForm.prototype.isBillingAddressStateValid = function () {
  if (!this.captureBillingAddress) return true
  let value = this.getBillingAddressState();
  return value !== null && value.length >= 2;
};

PaymentForm.prototype.isBillingAddressCityValid = function () {
  if (!this.captureBillingAddress) return true
  let value = this.getBillingAddressCity();
  return value !== null && 1 < value.length && value.length < 100;
};

PaymentForm.prototype.isBillingAddressDistrictValid = function () {
  if (!this.captureBillingAddress) return true
  let value = this.getBillingAddressDistrict();
  return value !== null && 1 < value.length && value.length < 100;
};

PaymentForm.prototype.isBillingAddressZipValid = function () {
  if (!this.captureBillingAddress) return true
  let value = this.getBillingAddressZip();
  return value !== null && 1 < value.length && value.length < 100;
};

PaymentForm.prototype.isBillingAddressStreetValid = function () {
  if (!this.captureBillingAddress) return true
  let value = this.getBillingAddressStreet();
  return value !== null && 1 < value.length && value.length < 100;
};

PaymentForm.prototype.isBillingAddressHouseNumberValid = function () {
  if (!this.captureBillingAddress) return true
  let value = this.getBillingAddressHouseNumber();
  return value !== null && 0 < value.length && value.length < 100;
};

PaymentForm.prototype.isBillingAddressAdditionalValid = function () {
  if (!this.captureBillingAddress) return true
  let value = this.getBillingAddressAdditional();
  return (value === null || value === "") || (0 < value.length && value.length < 100);
};

PaymentForm.prototype.isPocketTypeAmountValid = function (index) {
  if (!this.pocketTypes.items[index]) return true;
  let value = this.getPocketTypeAmount(index);
  return value !== null && value > 0;
};

PaymentForm.prototype.isPocketTypeSelectValid = function (index) {
  if (!this.pocketTypes.items[index]) return true;
  let value = this.getPocketTypeSelect(index);
  return value !== null && value.length > 0;
};

PaymentForm.prototype.isPocketTypeInstallmentsValid = function (index) {
  if (!this.pocketTypes.items[index]) return true;
  let value = this.getPocketTypeInstallments(index);
  return value !== null;
};
//========================================================================================================

/**
 * Validate if exists the fiscal number in the form
 *
 * @returns {boolean}
 */
PaymentForm.prototype.fiscalNumberAdded = function () {
  let fNumber = this.elem.find(".fiscal-number-wrapper");
  return fNumber.length >= 1;
};

/**
 * Validate if exists the expiry date in the form
 *
 * @returns {boolean}
 */
PaymentForm.prototype.expiryContainerAdded = function () {
  let exContainter = this.elem.find(".expiry-container");
  return exContainter.length >= 1;
};

/**
 * Validate if the cvc is displayed
 *
 * @returns {boolean}
 */
PaymentForm.prototype.cvcContainerAdded = function () {
  let cvcContainer = this.elem.find(".cvc-container");
  return cvcContainer.length >= 1;
};

/**
 * Validate if the nip is displayed
 *
 * @returns {boolean}
 */
PaymentForm.prototype.nipWrapperAdded = function () {
  let nipWrapper = this.elem.find(".nip-wrapper");
  return nipWrapper.length >= 1;
};

/**
 * Validate if the nip is displayed
 *
 * @returns {boolean}
 */
PaymentForm.prototype.otpWrapperAdded = function () {
  let otpWrapper = this.elem.find(".otp-wrapper");
  return otpWrapper.length >= 1;
};

/**
 * Validate if the message is displayed
 *
 * @returns {boolean}
 */
PaymentForm.prototype.validationMessageAdded = function () {
  let validactionMessage = this.elem.find(".validation-message");
  return validactionMessage.length >= 1;
};

/**
 * Validate if the keyboard is displayed
 *
 * @returns {boolean}
 */
PaymentForm.prototype.virtualKeyboardAdded = function () {
  let keyboardWrapper = this.elem.find(".keyboard-wrapper");
  return keyboardWrapper.length >= 1;
};

/**
 * Validate if the message is displayed
 *
 * @returns {boolean}
 */
PaymentForm.prototype.warningMessageAdded = function () {
  let warningMessage = this.elem.find(".warning-message");
  return warningMessage.length >= 1;
};

/**
 * Validate if exists the verification input in the form
 *
 * @returns {boolean}
 */
PaymentForm.prototype.verificationContainerAdded = function () {
  let verification_el = this.elem.find(".verification-container");
  return verification_el.length >= 1;
};

/**
 * Validate if the billing address is displayed
 *
 * @returns {boolean}
 */
PaymentForm.prototype.billingAddressAdded = function () {
  let billing_container = this.elem.find(".billing-address-container");
  return billing_container.length >= 1;
};

/**
 * Validate if exists the pocket type in the form
 *
 * @returns {boolean}
 */
PaymentForm.prototype.isPocketTypeAdded = function () {
  return this.pocketTypes.init;
};

/**
 * Check if a specific pocket type element (select, amount, or installments) exists in the form.
 * 
 * @param {string} type - The type of the pocket type element to check, can be "select", "amount", or "installments".
 * @param {number} index - The index of the pocket type element to check.
 * @returns {boolean} - Returns true if the pocket type element exists, false otherwise.
 */
PaymentForm.prototype.pocketTypeElmAdded = function (type, index) {
  const pocket_elm = this.pocketTypes.items[index][type];
  return pocket_elm.length >= 1;
}

// ======================================================================================================

/**
 * Get the card object.
 *
 * @returns {object}
 */
PaymentForm.prototype.getCard = function (e) {
  let data = null;
  if (!this.isValidData()) return data;

  let today = new Date();
  let currentYear = "" + today.getFullYear();
  let year = this.getExpiryYear();

  if (("" + year).length === 2) {
    year = currentYear.substring(0, 2) + "" + this.getExpiryYear();
  }

  data = {
    "card": {
      "number": this.getCardNumber().split(' ').join(''),
      "holder_name": this.getName(),
      "expiry_year": Number(year),
      "expiry_month": Number(this.getExpiryMonth()),
      "type": this.card_brand_id,
      "cvc": this.getCvc(),
      "nip": this.getNip(),
      "card_auth": this.getValidationOption(),
      "fiscal_number": this.getFiscalNumber()
    }

  };
  if (this.isPocketTypeAdded()) {
    data.card.brand_options = this.getPocketTypeData()
  }
  return data;

};

/**
 * Get the type of the card number inputted.
 *
 * @returns {string}
 */
PaymentForm.prototype.getCardType = function () {
  return this.brand_name;
};

/**
 * Get the name inputted.
 *
 * @returns {string}
 */
PaymentForm.prototype.getName = function () {
  return this.nameInput.val();
};

/**
 * Get the email inputted.
 *
 * @returns {string}
 */
PaymentForm.prototype.getEmail = function () {
  return this.emailInput.val();
};

/**
 * Get the cellphone inputted.
 *
 * @returns {string}
 */
PaymentForm.prototype.getCellPhone = function () {
  let calling_code = Payment.getCountryByCountryCode(this.cellphoneCountryCodeInput.val()).calling_code;
  return `${calling_code}-${this.cellPhoneInput.val().replace(/ /g, '')}`;
};

/**
 * Get the expiry month inputted.
 *
 * @returns {string}
 */
PaymentForm.prototype.getExpiryMonth = function () {
  return parseInt(this.expiryMonthInput.val()) ? this.expiryMonthInput.val() : 0;
};

/**
 * Get the expiry year inputted.
 *
 * @returns {string}
 */
PaymentForm.prototype.getExpiryYear = function () {
  return parseInt(this.expiryYearInput.val()) ? this.expiryYearInput.val() : 0;
};

/**
 * Get the fiscal number inputted.
 *
 * @returns {string}
 */
PaymentForm.prototype.getFiscalNumber = function () {
  if (this.fiscalNumberAdded()) {
    return this.fiscalNumberInput.val();
  } else {
    return '';
  }
};

/**
 * Get the type of validation
 *
 * @returns {number}
 */
PaymentForm.prototype.getValidationOption = function () {
  let val = PaymentForm.AUTH_CVC;
  if (this.nipWrapperAdded()) {
    val = PaymentForm.AUTH_NIP;
  }
  return val;
};

/**
 * Get the CVC number inputted.
 *
 * @returns {string}
 */
PaymentForm.prototype.getCvc = function () {
  if (this.getValidationOption() === PaymentForm.AUTH_CVC) {
    return this.cvcInput.val();
  } else {
    return "";
  }
};

/**
 * Get the NIP number inputted.
 *
 * @returns {string}
 */
PaymentForm.prototype.getNip = function () {
  if (this.getValidationOption() === PaymentForm.AUTH_NIP) {
    if (this.nipWrapperAdded() && !this.USE_VIRTUAL_KEYBOARD) {
      this.nip = (this.nipInput.val());
    }
    return this.nip;
  } else {
    return "";
  }
};

/**
 * Get the CVC number inputted.
 *
 * @returns {string}
 */
PaymentForm.prototype.getVerificationValue = function () {
  if (this.verificationContainerAdded()) {
    return this.verificationInput.val();
  } else {
    return '';
  }
};

PaymentForm.prototype.getBillingAddressCountry = function () {
  if (this.billingAddressAdded()) {
    return this.billingAddressCountry.val().trim();
  } else {
    return null;
  }
};

PaymentForm.prototype.getBillingAddressState = function () {
  if (this.billingAddressAdded()) {
    return this.billingAddressState.val().trim();
  } else {
    return null;
  }
};

PaymentForm.prototype.getBillingAddressCity = function () {
  if (this.billingAddressAdded()) {
    return this.billingAddressCity.val().trim();
  } else {
    return null;
  }
};

PaymentForm.prototype.getBillingAddressDistrict = function () {
  if (this.billingAddressAdded()) {
    return this.billingAddressDistrict.val().trim();
  } else {
    return null;
  }
};

PaymentForm.prototype.getBillingAddressZip = function () {
  if (this.billingAddressAdded()) {
    return this.billingAddressZip.val().trim();
  } else {
    return null;
  }
};

PaymentForm.prototype.getBillingAddressStreet = function () {
  if (this.billingAddressAdded()) {
    return this.billingAddressStreet.val().trim();
  } else {
    return null;
  }
};

PaymentForm.prototype.getBillingAddressHouseNumber = function () {
  if (this.billingAddressAdded()) {
    return this.billingAddressHouseNumber.val().trim();
  } else {
    return null;
  }
};

PaymentForm.prototype.getBillingAddressAdditional = function () {
  if (this.billingAddressAdded()) {
    return this.billingAddressAdditional.val().trim();
  } else {
    return null;
  }
};

/**
 * Get billing address
 *
 * @returns {object}
 */
PaymentForm.prototype.getBillingAddress = function () {
  let billing_address = {};
  if (this.billingAddressAdded()) {
    billing_address = {
      "country": this.getBillingAddressCountry(),
      "state": this.getBillingAddressState(),
      "city": this.getBillingAddressCity(),
      "district": this.getBillingAddressDistrict(),
      "zip": this.getBillingAddressZip(),
      "street": this.getBillingAddressStreet(),
      "house_number": this.getBillingAddressHouseNumber(),
      "additional_address_info": this.getBillingAddressAdditional(),
    }
  }
  return billing_address;
};

PaymentForm.prototype.getPocketTransactions = function () {
  return this.pocketTypes.items.map(function (_, index) {
    const pocketTransaction = {
      amount: this.getPocketTypeAmount(index),
      type_pocket: this.getPocketTypeSelect(index),
    };
    const currentInstallments = parseInt(this.getPocketTypeInstallments(index));
    if (this.pocketTypes.optionsType[pocketTransaction.type_pocket] === "credit") {
      pocketTransaction.installments = currentInstallments;
    }
    return pocketTransaction;
  }, this);
}

PaymentForm.prototype.getPocketTypeData = function () {
  if (this.isPocketTypeAdded()) {
    const splitId = "split_" + Object.keys(this.configuration)[0];
    const pocketData = {
      [splitId]: {
        transactions: this.getPocketTransactions()
      }
    }
    return pocketData;
  } else {
    return {};
  }
};

/**
 * Get the amount for a specific pocket type item.
 *
 * @param {number} index - The index of the pocket type item to get the amount for.
 * @returns {string|null} - The amount of the pocket type item as a string, or null if the amount element does not exist.
 */
PaymentForm.prototype.getPocketTypeAmount = function (index) {
  const pocketItem = this.pocketTypes.items[index];
  if (pocketItem.amount && pocketItem.amount[0]) {
    return parseInt(pocketItem.amount[0].value);
  }
  return null;
};

/**
 * Get the value of the selection field for a specific pocket type item.
 *
 * @param {number} index - The index of the pocket type item to get the selection field value for.
 * The index must be an integer and must be within the range of items in the `this.pocketTypes.items` property.
 * @returns {string|null} - The value of the selection field for the pocket type item, or null if the item does not exist.
 */
PaymentForm.prototype.getPocketTypeSelect = function (index) {
  const pocketItem = this.pocketTypes.items[index];
  if (pocketItem) {
    return pocketItem.selectController.getValue().trim();
  }
  return null;
};

/**
 * Get the value of the installments field for a specific pocket type item.
 *
 * @param {number} index - The index of the pocket type item to get the installments field value for.
 * The index must be an integer and must be within the range of items in the `this.pocketTypes.items` property.
 * @returns {string|null} - The value of the installments field for the pocket type item, or null if the item does not exist.
 */
PaymentForm.prototype.getPocketTypeInstallments = function (index) {
  const pocketItem = this.pocketTypes.items[index];
  if (pocketItem) {
    return pocketItem.installments.val();
  }
  return null;
};


// --- --- --- --- --- --- --- --- --- --- ---

/**
 * Reset the form and disable the initial inputs
 *
 * @returns {string}
 */
PaymentForm.prototype.blockForm = function () {

  this.isBlocked = true;

  // Setup display
  this.emailInput.val("");
  this.emailInput.attr("disabled", "disabled");

  this.cellPhoneInput.val("");
  this.cellPhoneInput.attr("disabled", "disabled");

  this.nameInput.val("");
  this.nameInput.attr("disabled", "disabled");

  if (this.EXPIRY_USE_DROPDOWNS) {
    this.expiryMonthInput.val("");
    this.expiryMonthInput.attr("disabled", "disabled");

    this.expiryYearInput.val("");
    this.expiryYearInput.attr("disabled", "disabled");
  } else {
    this.expiryMonthYearInput.val("");
    this.expiryMonthYearInput.attr("disabled", "disabled");
  }

  this.cvcInput.val("");
  this.cvcInput.attr("disabled", "disabled");

  if (this.fiscalNumberAdded()) {
    this.fiscalNumberInput.val("");
    this.fiscalNumberInput.attr("disabled", "disabled");
  }

  if (this.nipWrapperAdded()) {
    this.cleanNipInput();
    this.nipInput.attr("disabled", "disabled");
  }

  this.cardNumberInput.parent().addClass("has-error");

  this.addWarningMessage();
};


/**
 * Reset the form to enable the initial inputs
 *
 * @returns {string}
 */
PaymentForm.prototype.unBlockForm = function () {
  this.isBlocked = false;

  // Setup display
  this.emailInput.removeAttr("disabled");
  this.cellPhoneInput.removeAttr("disabled");
  this.nameInput.removeAttr("disabled");
  if (this.EXPIRY_USE_DROPDOWNS) {
    this.expiryMonthInput.removeAttr("disabled");
    this.expiryYearInput.removeAttr("disabled");
  } else {
    this.expiryMonthYearInput.removeAttr("disabled");
  }
  this.cvcInput.removeAttr("disabled");
  if (this.fiscalNumberAdded()) {
    this.fiscalNumberInput.removeAttr("disabled");
  }
  if (this.nipWrapperAdded()) {
    this.cleanNipInput();
    this.nipInput.removeAttr("disabled");
  }
  this.cardNumberInput.parent().removeClass("has-error");
  this.removeWarningMessage();
};

// --- --- --- --- --- --- --- --- --- --- ---

/**
 * Set the icon colour.
 *
 * @param colour
 */
PaymentForm.prototype.setIconColour = function (colour) {
  this.elem.find(".icon .svg").css({ "fill": colour });
};

/**
 *
 */
PaymentForm.prototype.refreshCreditCardType = function () {
  let number = PaymentForm.numbersOnlyString(this.getCardNumber());
  if (number.length >= 6) {
    this.cardTypeFromNumberBin(number);
  }
};

/**
 *
 */
PaymentForm.prototype.refreshCreditCardNumberFormat = function () {
  let numbersOnly = PaymentForm.numbersOnlyString($(this.cardNumberInput).val());
  let formattedNumber = PaymentForm.applyFormatMask(numbersOnly, this.creditCardNumberMask);
  $(this.cardNumberInput).val(formattedNumber);
};

/**
 *
 */
PaymentForm.prototype.refreshExpiryMonthYearInput = function () {
  let numbersOnly = PaymentForm.numbersOnlyString($(this.expiryMonthYearInput).val());
  let formattedNumber = PaymentForm.applyFormatMask(numbersOnly, PaymentForm.EXPIRY_MASK);
  $(this.expiryMonthYearInput).val(formattedNumber);
};

/**
 *
 */
PaymentForm.prototype.refreshCvc = function () {
  $(this.cvcInput).val(PaymentForm.numbersOnlyString($(this.cvcInput).val()));
};

/**
 *
 */
PaymentForm.prototype.refreshNip = function () {
  $(this.nipInput).val(PaymentForm.numbersOnlyString($(this.nipInput).val()));
};

/**
 *
 */
PaymentForm.prototype.refreshVerificationInput = function () {
  $(this.verificationInput).val(PaymentForm.numbersOnlyString($(this.verificationInput).val()));
};

/**
 *
 */
PaymentForm.prototype.refreshCellPhoneFormat = function () {
  let numbersOnly = PaymentForm.numbersOnlyString($(this.cellPhoneInput).val());
  let formattedNumber = PaymentForm.applyFormatMask(numbersOnly, PaymentForm.CELLPHONE_MASK);
  $(this.cellPhoneInput).val(formattedNumber);
};

/**
 * Get country flag image src
 */
PaymentForm.prototype.refreshCellphoneCountryCode = function () {
  let currentCountryCode = this.cellphoneCountryCodeInput.find("option:selected").data("code") || null;
  if (currentCountryCode) {
    let flag = Payment.getCountryByCountryCode(currentCountryCode).flag;
    this.cellPhoneCountryCodeFlag.setAttribute('src', flag);
  }
};

/**
 * Get country flag image src
 */
PaymentForm.prototype.refreshBillingAddressCountryFlag = function () {
  let currentCountryCode = this.billingAddressCountry.find("option:selected").data("code") || null;
  if (currentCountryCode) {
    let flag = Payment.getCountryByCountryCode(currentCountryCode).flag;
    this.billingAddressCountryFlag.setAttribute('src', flag);
  }
};

PaymentForm.prototype.refreshBillingAddressStateOptions = function () {
  const defaultCountry = Payment.getCountryByCountryCode(this.getBillingAddressCountry());
  if (defaultCountry === undefined) {
    this.billingStateSelectizeControl.clear();
    this.billingStateSelectizeControl.clearOptions();
    return
  }

  let states = defaultCountry.states
  if (states === undefined) {
    states = [{
      code: defaultCountry.code,
      name: defaultCountry.name,
    }]
  }

  if (this.billingStateSelectizeControl === undefined) {
    let billingStateSelectize = this.billingAddressState.selectize(
      {
        valueField: 'code',
        labelField: 'name',
        searchField: 'name',
        options: states,
      }
    );
    this.billingStateSelectizeControl = billingStateSelectize[0].selectize;
    this.billingStateSelectizeControl.setValue(states[0].code);
  } else {
    this.billingStateSelectizeControl.clear();
    this.billingStateSelectizeControl.clearOptions();
    this.billingStateSelectizeControl.addOption(states);
    this.billingStateSelectizeControl.setValue(states[0].code);
  }
};

/**
 *
 */
PaymentForm.prototype.refreshCellPhoneFormat = function () {
  let numbersOnly = PaymentForm.numbersOnlyString($(this.cellPhoneInput).val());
  let formattedNumber = PaymentForm.applyFormatMask(numbersOnly, PaymentForm.CELLPHONE_MASK);
  $(this.cellPhoneInput).val(formattedNumber);
};

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

PaymentForm.prototype.addFiscalNumber = function () {
  if (!this.fiscalNumberAdded()) {
    this.initFiscalNumberInput();
    this.setupFiscalNumberInput();
    this.setIconColour(this.iconColour);
  }
};

PaymentForm.prototype.removeFiscalNumber = function () {
  if (this.fiscalNumberAdded()) {
    this.elem.find(".fiscal-number-wrapper").remove();
  }
};

PaymentForm.prototype.addExpiryContainer = function () {
  if (!this.expiryContainerAdded()) {
    this.initExpiryMonthInput();
    this.initExpiryYearInput();
    this.setupExpiryInput();
    this.setIconColour(this.iconColour);
  }
};

PaymentForm.prototype.removeExpiryContainer = function () {
  if (this.expiryContainerAdded()) {
    this.elem.find(".expiry-container").remove();
  }
};

PaymentForm.prototype.addCvcContainer = function () {
  if (!this.cvcContainerAdded()) {
    this.initCvcInput();
    this.setupCvcInput();
    this.setIconColour(this.iconColour);
  }
};

PaymentForm.prototype.removeCvcContainer = function () {
  if (this.cvcContainerAdded()) {
    this.elem.find(".cvc-container").remove();
  }
};

PaymentForm.prototype.addNip = function () {
  if (!this.otpWrapperAdded()) {
    if (!this.nipWrapperAdded()) {
      this.initNipInput();
      this.setupNipInput();
      this.setIconColour(this.iconColour);
    }
  } else {
    if (this.getValidationOption() === PaymentForm.AUTH_NIP && !this.nipWrapperAdded()) {
      this.initNipInput();
      this.setupNipInput();
      this.setIconColour(this.iconColour);
    }
  }
};

PaymentForm.prototype.removeNip = function () {
  if (this.nipWrapperAdded()) {
    this.elem.find(".nip-wrapper").remove();
  }
};

PaymentForm.prototype.addOtpValidation = function () {
  if (!this.otpWrapperAdded() && this.USE_OTP) {
    this.initOtpValidation();
    this.setupOtpValidation();
  }
};

PaymentForm.prototype.removeOtpValidation = function () {
  if (this.otpWrapperAdded()) {
    this.elem.find(".otp-wrapper").remove();
  }
};

PaymentForm.prototype.addVirtualKeyboard = function () {
  if (!this.virtualKeyboardAdded() && this.getValidationOption() === PaymentForm.AUTH_NIP) {
    this.setupVirtualKeyboard()
  }
};

PaymentForm.prototype.removeVirtualKeyboard = function () {
  if (this.virtualKeyboardAdded()) {
    this.elem.find(".keyboard-wrapper").remove();
  }
};

PaymentForm.prototype.addValidationMessage = function () {
  if (!this.validationMessageAdded()) {
    this.setupValidationMessage()
  }
};

PaymentForm.prototype.removeValidationMessage = function () {
  if (this.validationMessageAdded()) {
    this.elem.find(".validation-message").remove();
  }
};

PaymentForm.prototype.addWarningMessage = function () {
  if (!this.warningMessageAdded()) {
    this.setupWarningMessage();
  }
};

PaymentForm.prototype.removeWarningMessage = function () {
  if (this.warningMessageAdded()) {
    this.elem.find(".warning-message").remove();
  }
};

PaymentForm.prototype.addVerificationContainer = function () {
  if (!this.verificationContainerAdded()) {
    this.cardNumberInput.attr("disabled", "disabled");
    this.emailInput.attr("disabled", "disabled");
    this.cellPhoneInput.attr("disabled", "disabled");
    this.nameInput.attr("disabled", "disabled");
    this.cvcInput.attr("disabled", "disabled");

    if (this.EXPIRY_USE_DROPDOWNS) {
      this.expiryMonthInput.attr("disabled", "disabled");
      this.expiryYearInput.attr("disabled", "disabled");
    } else {
      this.expiryMonthYearInput.attr("disabled", "disabled");
    }

    if (this.fiscalNumberAdded()) {
      this.fiscalNumberInput.attr("disabled", "disabled")
    }
    if (this.nipWrapperAdded()) {
      this.nipInput.attr("disabled", "disabled")
    }

    this.initVerificationInput();
    this.setupVerificationInput();
    this.setIconColour(this.iconColour);
  }
};

PaymentForm.prototype.disablePocketTypesBtns = function () {
  this.pocketTypes.addButton.addClass('disabled');
  $(".pocket-type-button-remove").addClass('disabled');
};
PaymentForm.prototype.enablePocketTypesBtns = function () {
  this.pocketTypes.addButton.removeClass('disabled');
  $(".pocket-type-button-remove").last().removeClass('disabled');
};

PaymentForm.prototype.blockVerificationContainer = function () {
  if (this.verificationContainerAdded()) {
    this.verificationInput.attr('disabled', 'disabled');
    this.verificationBtn.attr('disabled', 'disabled');
  }
};

PaymentForm.prototype.unBlockVerificationContainer = function () {
  if (this.verificationContainerAdded()) {
    this.cardNumberInput.removeAttr('disabled');
    this.emailInput.removeAttr('disabled');
    this.cellPhoneInput.removeAttr('disabled');
    this.nameInput.removeAttr('disabled');
    this.cvcInput.removeAttr('disabled');

    if (this.EXPIRY_USE_DROPDOWNS) {
      this.expiryMonthInput.removeAttr('disabled');
      this.expiryYearInput.removeAttr('disabled');
    } else {
      this.expiryMonthYearInput.removeAttr('disabled');
    }

    if (this.fiscalNumberAdded()) {
      this.fiscalNumberInput.removeAttr('disabled');
    }
    if (this.nipWrapperAdded()) {
      this.nipInput.removeAttr('disabled');
    }

    this.verificationInput.removeAttr('disabled');
    this.verificationBtn.removeAttr('disabled');
  }
};

PaymentForm.prototype.removeVerificationContainer = function () {
  if (this.verificationContainerAdded()) {
    this.removeWarningMessage();
    this.elem.find(".verification-container").remove();
  }
};

PaymentForm.prototype.addPocketType = function () {
  if (!this.isPocketTypeAdded()) {
    this.setupPocketTypeContainer();
  }
};

PaymentForm.prototype.removePocketType = function () {
  if (this.isPocketTypeAdded()) {
    this.elem.find(".pocket-type-container").remove();
    this.pocketTypes.items = [];
    this.pocketTypes.init = false;
  }
};

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

/**
 * Initialise the card number input
 */
PaymentForm.prototype.initCardNumberInput = function () {

  // Find or create the card number input element
  this.cardNumberInput = PaymentForm.detachOrCreateElement(this.elem, ".card-number", "<input class='card-number' />");
  // Ensure the card number element has a name
  if (!PaymentForm.elementHasAttribute(this.cardNumberInput, "name")) {
    this.cardNumberInput.attr("name", "card-number");
  }
  // Ensure the card number has a placeholder
  if (!PaymentForm.elementHasAttribute(this.cardNumberInput, "placeholder")) {
    this.cardNumberInput.attr("placeholder", PaymentForm.CREDIT_CARD_NUMBER_PLACEHOLDER);
  }
  this.cardNumberInput.attr("type", "tel");
  this.cardNumberInput.attr("maxlength", this.creditCardNumberMask.length);
  this.cardNumberInput.attr("x-autocompletetype", "cc-number");
  this.cardNumberInput.attr("autocompletetype", "cc-number");
  this.cardNumberInput.attr("autocorrect", "off");
  this.cardNumberInput.attr("spellcheck", "off");
  this.cardNumberInput.attr("autocapitalize", "off");
};

/**
 * Initialise the name input
 */
PaymentForm.prototype.initNameInput = function () {

  // Enable name input if a field has been created
  if (!this.captureName)
    this.captureName = this.elem.find(".name")[0] != null;
  // Find or create the name input element
  this.nameInput = PaymentForm.detachOrCreateElement(this.elem, ".name", "<input class='name' />");
  // Ensure the name element has a field name
  if (!PaymentForm.elementHasAttribute(this.nameInput, "name")) {
    this.nameInput.attr("name", "card-holder");
  }
  // Ensure the name element has a placeholder
  if (!PaymentForm.elementHasAttribute(this.nameInput, "placeholder")) {
    this.nameInput.attr("placeholder", PaymentForm.NAME_PLACEHOLDER);
  }
};

/**
 * Initialise the email input
 */
PaymentForm.prototype.initEmailInput = function () {

  // Enable email input if a field has been created
  if (!this.captureEmail)
    this.captureEmail = this.elem.find(".email")[0] != null;
  // Find or create the email input element
  this.emailInput = PaymentForm.detachOrCreateElement(this.elem, ".email", "<input class='email' />");
  // Ensure the email element has a field email
  if (!PaymentForm.elementHasAttribute(this.emailInput, "name")) {
    this.emailInput.attr("name", "email");
  }
  // Ensure the email element has a placeholder
  if (!PaymentForm.elementHasAttribute(this.emailInput, "placeholder")) {
    this.emailInput.attr("placeholder", PaymentForm.EMAIL_PLACEHOLDER);
  }
  this.emailInput.attr("type", "email");
  this.emailInput.attr("autocorrect", "off");
  this.emailInput.attr("spellcheck", "off");
  this.emailInput.attr("autocapitalize", "off");
};

/**
 * Initialise the cellphone input
 */
PaymentForm.prototype.initCellPhoneInput = function () {

  // Enable cellphone input if a field has been created
  if (!this.captureCellPhone)
    this.captureCellPhone = this.elem.find(".cellphone")[0] != null;
  // Find or create the cellphone input element
  this.cellphoneCountryCodeInput = PaymentForm.detachOrCreateElement(this.elem, ".cellphone-country-code", "<select class='cellphone-country-code' />");
  this.cellPhoneInput = PaymentForm.detachOrCreateElement(this.elem, ".cellphone", "<input class='cellphone' />");
  // Ensure the cellphone element has a field cellphone
  if (!PaymentForm.elementHasAttribute(this.cellPhoneInput, "name")) {
    this.cellPhoneInput.attr("name", "cellphone");
  }
  if (!PaymentForm.elementHasAttribute(this.cellphoneCountryCodeInput, "name")) {
    this.cellphoneCountryCodeInput.attr("name", "cellphone-country-code");
  }
  // Ensure the cellphone element has a placeholder
  if (!PaymentForm.elementHasAttribute(this.cellPhoneInput, "placeholder")) {
    this.cellPhoneInput.attr("placeholder", PaymentForm.CELLPHONE_PLACEHOLDER);
  }
  this.cellPhoneInput.attr("type", "tel");
  this.cellPhoneInput.attr("autocorrect", "off");
  this.cellPhoneInput.attr("spellcheck", "off");
  this.cellPhoneInput.attr("autocapitalize", "off");

  let $this = this;

  const options = Payment.COUNTRIES.filter(country => country.active);

  setTimeout(() => {
    this.cellphoneSelectize = $this.cellphoneCountryCodeInput.selectize(
      {
        valueField: 'code',
        labelField: 'name',
        searchField: 'name',
        options: options,
      }
    );
    this.cellphoneSelectizeControl = this.cellphoneSelectize[0].selectize;
    const defaultCountry = this.defaultCountryCode ? this.defaultCountryCode : Payment.guessCountry();
    this.cellphoneSelectizeControl.setValue(defaultCountry)
  }, 0);

};

/**
 * Initialise the expiry month input
 */
PaymentForm.prototype.initExpiryMonthInput = function () {
  this.expiryMonthInput = PaymentForm.detachOrCreateElement(this.elem, ".expiry-month", "<input class='expiry-month' />");
};

/**
 * Initialise the expiry year input
 */
PaymentForm.prototype.initExpiryYearInput = function () {
  this.expiryYearInput = PaymentForm.detachOrCreateElement(this.elem, ".expiry-year", "<input class='expiry-year' />");
};

/**
 * Initialise the card CVC input
 */
PaymentForm.prototype.initCvcInput = function () {

  // Find or create the CVC input element
  this.cvcInput = PaymentForm.detachOrCreateElement(this.elem, ".cvc", "<input class='cvc' />");
  // Ensure the CVC has a placeholder
  if (!PaymentForm.elementHasAttribute(this.cvcInput, "placeholder")) {
    this.cvcInput.attr("placeholder", PaymentForm.CVC_PLACEHOLDER);
  }
  this.cvcInput.attr("type", "tel");
  this.cvcInput.attr("maxlength", this.cvcLenght);
  this.cvcInput.attr("x-autocompletetype", "cc-csc");
  this.cvcInput.attr("autocompletetype", "cc-csc");
  this.cvcInput.attr("autocorrect", "off");
  this.cvcInput.attr("spellcheck", "off");
  this.cvcInput.attr("autocapitalize", "off");
  if (!this.IS_MOBILE) {
    this.cvcInput.attr("type", "password");
  }
};

/**
 * Initialise the fiscal number input
 */
PaymentForm.prototype.initFiscalNumberInput = function () {

  // Find or create the fiscal number input element
  this.fiscalNumberInput = PaymentForm.detachOrCreateElement(this.elem, ".fiscal-number", "<input class='fiscal-number' />");
  // Ensure the fiscal number element has a field name
  if (!PaymentForm.elementHasAttribute(this.fiscalNumberInput, "name")) {
    this.fiscalNumberInput.attr("name", "fiscal-number");
  }
  // Ensure the fiscal number element has a placeholder
  if (!PaymentForm.elementHasAttribute(this.fiscalNumberInput, "placeholder")) {
    this.fiscalNumberInput.attr("placeholder", PaymentForm.FISCAL_NUMBER_PLACEHOLDER);
  }
  this.fiscalNumberInput.attr("type", "text");
  this.fiscalNumberInput.attr("pattern", "[0-9A-Za-z]*");
  this.fiscalNumberInput.attr("inputmode", "text");
  this.fiscalNumberInput.attr("x-autocompletetype", "cc-csc");
  this.fiscalNumberInput.attr("autocompletetype", "cc-csc");
  this.fiscalNumberInput.attr("autocorrect", "off");
  this.fiscalNumberInput.attr("spellcheck", "off");
  this.fiscalNumberInput.attr("autocapitalize", "off");
};

/**
 * Initialise the card NIP input
 */
PaymentForm.prototype.initNipInput = function () {
  // Find or create the NIP input element
  this.nipInput = PaymentForm.detachOrCreateElement(this.elem, ".nip", "<input class='nip' />");
  // Ensure the NIP has a placeholder
  if (!PaymentForm.elementHasAttribute(this.nipInput, "placeholder")) {
    this.nipInput.attr("placeholder", PaymentForm.NIP_PLACEHOLDER);
  }
  this.nipInput.attr("type", "tel");
  this.nipInput.attr("pattern", "[0-9]*");
  this.nipInput.attr("inputmode", "numeric");
  this.nipInput.attr("maxlength", this.nipLenght);
  this.nipInput.attr("x-autocompletetype", "cc-csc");
  this.nipInput.attr("autocompletetype", "cc-csc");
  this.nipInput.attr("autocorrect", "off");
  this.nipInput.attr("spellcheck", "off");
  this.nipInput.attr("autocapitalize", "off");
  if (this.USE_VIRTUAL_KEYBOARD) {
    this.nipInput.attr("readonly", "true");
    this.nipInput.attr("type", "password");
  }
};

/**
 * Initialise the checkbox to otp validation option
 */
PaymentForm.prototype.initOtpValidation = function () {
  this.otpValidation = PaymentForm.detachOrCreateElement(this.elem, ".otp", "<input class='otp' />");
  this.otpValidation.attr("type", "checkbox");
  this.otpValidation.attr("id", "otp-option");
};

/**
 * Initialize the div to messages
 */
PaymentForm.prototype.initOtpValidation = function () {
  this.otpValidation = PaymentForm.detachOrCreateElement(this.elem, ".messages", "<div class='.messages' />");
};

/**
 * Initialise the verification input and button
 */
PaymentForm.prototype.initVerificationInput = function () {
  // Find or create the verification input element
  this.verificationInput = PaymentForm.detachOrCreateElement(this.elem, ".verification", "<input class='verification' />");
  // Ensure the verification has a placeholder
  if (!PaymentForm.elementHasAttribute(this.verificationInput, "placeholder")) {
    this.verificationInput.attr("placeholder", PaymentForm.VERIFICATION_PLACEHOLDER);
  }
  this.verificationInput.attr("type", "text");
  this.verificationInput.attr("maxlength", this.verificationLenght);
  this.verificationInput.attr("x-autocompletetype", "cc-csc");
  this.verificationInput.attr("autocompletetype", "cc-csc");
  this.verificationInput.attr("autocorrect", "off");
  this.verificationInput.attr("spellcheck", "off");
  this.verificationInput.attr("autocapitalize", "off");
  // if (!this.IS_MOBILE) {
  //   this.verificationInput.attr("type", "password");
  // }

  // Find or create the verification button element
  this.verificationBtn = PaymentForm.detachOrCreateElement(this.elem, ".verification-btn", "<input class='verification-btn' />");
  this.verificationBtn.attr("type", "button");
  this.verificationBtn.attr("disabled", "disabled");
  this.verificationBtn.attr("value", "Validar");
};

/**
 * Initialise the billing address form
 */
PaymentForm.prototype.initBillingAddress = function () {
  // Validate if is required initialize the form
  if (!this.captureBillingAddress) return

  // Country options
  this.billingAddressCountry = PaymentForm.detachOrCreateElement(this.elem, ".billingAddressCountry", "<select class='billingAddressCountry' />");
  let $this = this;
  setTimeout(() => {
    let billingCountrySelectize = $this.billingAddressCountry.selectize(
      {
        valueField: 'code',
        labelField: 'name',
        searchField: 'name',
        options: Payment.COUNTRIES.filter(country => country.active),
      }
    );
    let billingCountrySelectizeControl = billingCountrySelectize[0].selectize;
    const defaultCountry = $this.defaultCountryCode ? $this.defaultCountryCode : Payment.guessCountry();
    billingCountrySelectizeControl.setValue(defaultCountry)
  }, 0);

  // State options
  this.billingAddressState = PaymentForm.detachOrCreateElement(this.elem, ".billingAddressState", "<select class='billingAddressState' />");
  setTimeout(() => {
    $this.refreshBillingAddressStateOptions();
  }, 0);

  // Create billing elements
  this.billingAddressCity = PaymentForm.detachOrCreateElement(this.elem, ".billingAddressCity", "<input class='billingAddressCity' />");
  this.billingAddressDistrict = PaymentForm.detachOrCreateElement(this.elem, ".billingAddressDistrict", "<input class='billingAddressDistrict' />");
  this.billingAddressZip = PaymentForm.detachOrCreateElement(this.elem, ".billingAddressZip", "<input class='billingAddressZip' />");
  this.billingAddressStreet = PaymentForm.detachOrCreateElement(this.elem, ".billingAddressStreet", "<input class='billingAddressStreet' />");
  this.billingAddressHouseNumber = PaymentForm.detachOrCreateElement(this.elem, ".billingAddressHouseNumber", "<input class='billingAddressHouseNumber' />");
  this.billingAddressAdditional = PaymentForm.detachOrCreateElement(this.elem, ".billingAddressAdditional", "<input class='billingAddressAdditional' />");

  this.billingAddressCountry.attr("placeholder", this.__('billingAddressCountry'));
  this.billingAddressState.attr("placeholder", this.__('billingAddressState'));
  this.billingAddressCity.attr("placeholder", this.__('billingAddressCity'));
  this.billingAddressDistrict.attr("placeholder", this.__('billingAddressDistrict'));
  this.billingAddressZip.attr("placeholder", this.__('billingAddressZip'));
  this.billingAddressStreet.attr("placeholder", this.__('billingAddressStreet'));
  this.billingAddressHouseNumber.attr("placeholder", this.__('billingAddressHouseNumber'));
  this.billingAddressAdditional.attr("placeholder", this.__('billingAddressAdditional'));
};

/**
 * Initialise the pocket type input
 */

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

PaymentForm.prototype.setupCardNumberInput = function () {
  this.elem.append("<div class='card-number-wrapper'></div>");
  let wrapper = this.elem.find(".card-number-wrapper");
  wrapper.append(this.cardNumberInput);
  wrapper.append("<div class='card-type-icon'></div>");
  wrapper.append("<div class='icon'></div>");
  wrapper.find(".icon").append(PaymentForm.CREDIT_CARD_SVG);

  // Events
  let $this = this;
  this.cardNumberInput.keydown(function (e) {
    PaymentForm.handleMaskedNumberInputKey(e, $this.creditCardNumberMask);
  });
  this.cardNumberInput.keyup(function () {
    $this.refreshCreditCardType();
  });
  this.cardNumberInput.on('paste', function () {
    setTimeout(function () {
      $this.refreshCreditCardNumberFormat();
      $this.refreshCreditCardType();
    }, 1);
  });
  this.cardNumberInput.blur(function () {
    $this.refreshCreditCardNumberFormat();
    $this.refreshCreditCardType();
    $this.refreshCardNumberValidation();
  });
};

PaymentForm.prototype.setupNameInput = function () {
  if (this.captureName) {
    this.elem.append("<div class='name-wrapper'></div>");
    let wrapper = this.elem.find(".name-wrapper");
    wrapper.append(this.nameInput);
    wrapper.append("<div class='icon'></div>");
    wrapper.find(".icon").append(PaymentForm.USER_SVG);

    // Events
    let $this = this;
    this.nameInput.blur(function () {
      $this.refreshCardHolderNameValidation();
    });
    this.nameInput.on("input", function () {
      var regexp = /[0-9]/g;
      if ($(this).val().match(regexp)) {
        $(this).val($(this).val().replace(regexp, ''));
      }
    });
  }
};

PaymentForm.prototype.setupEmailInput = function () {
  if (this.captureEmail) {
    this.elem.append("<div class='email-wrapper'></div>");
    let wrapper = this.elem.find(".email-wrapper");
    wrapper.append(this.emailInput);
    wrapper.append("<div class='icon'></div>");
    wrapper.find(".icon").append(PaymentForm.MAIL_SVG);

    // Events
    let $this = this;
    this.emailInput.blur(function () {
      $this.refreshEmailValidation();
    });
  }
};

PaymentForm.prototype.setupCellPhoneInput = function () {
  if (this.captureCellPhone) {
    this.elem.append("<div class='cellphone-container'><div class='cellphone-wrapper'></div></div>");
    let wrapper = this.elem.find(".cellphone-wrapper");
    wrapper.append(this.cellphoneCountryCodeInput);
    wrapper.append(this.cellPhoneInput);
    wrapper.append("<div class='icon'><img class='flag'/></div>");
    this.cellPhoneCountryCodeFlag = wrapper.find(".flag")[0];

    wrapper.append("<div class='icon icon-phone'></div>");
    wrapper.find(".icon-phone").append(PaymentForm.CELLPHONE_SVG);

    // Events
    let $this = this;
    this.cellPhoneInput.keydown(function (e) {
      PaymentForm.handleMaskedNumberInputKey(e, PaymentForm.CELLPHONE_MASK);
    });
    this.cellPhoneInput.blur(function () {
      $this.refreshCellPhoneFormat();
      $this.refreshCellPhoneValidation();
    });
    this.cellphoneCountryCodeInput.change(function () {
      $this.refreshCellphoneCountryCode();
    });
  }
};

PaymentForm.prototype.setupExpiryInput = function () {
  this.elem.append("<div class='expiry-container'><div class='expiry-wrapper'></div></div>");
  let wrapper = this.elem.find(".expiry-wrapper");
  let expiryInput;

  // Use dropdowns, It doesn't really works, not yet lml
  if (this.EXPIRY_USE_DROPDOWNS) {
    expiryInput = $("<div></div>");

    let expiryMonthNew = $(
      "<select>" +
      "<option value='any' selected='' hidden=''>MM</option>" +
      "<option value='1'>01</option>" +
      "<option value='2'>02</option>" +
      "<option value='3'>03</option>" +
      "<option value='4'>04</option>" +
      "<option value='5'>05</option>" +
      "<option value='6'>06</option>" +
      "<option value='7'>07</option>" +
      "<option value='8'>08</option>" +
      "<option value='9'>09</option>" +
      "<option value='10'>10</option>" +
      "<option value='11'>11</option>" +
      "<option value='12'>12</option>" +
      "</select>"
    );
    let expiryMonthOld = this.expiryMonthInput;
    PaymentForm.copyAllElementAttributes(expiryMonthOld, expiryMonthNew);
    this.expiryMonthInput.remove();
    this.expiryMonthInput = expiryMonthNew;

    let expiryYearNew = $("<select><option value='any' selected='' hidden=''>YY</option></select>");
    let currentYear = parseInt(((new Date().getFullYear()).toString()).substring(2, 4));
    for (let i = 0; i < PaymentForm.EXPIRY_NUMBER_OF_YEARS; i++) {
      expiryYearNew.append("<option value='" + currentYear + "'>" + currentYear + "</option>");
      currentYear = (currentYear + 1) % 100;
    }
    let expiryYearOld = this.expiryYearInput;
    PaymentForm.copyAllElementAttributes(expiryYearOld, expiryYearNew);
    this.expiryYearInput.remove();
    this.expiryYearInput = expiryYearNew;

    expiryInput.append(this.expiryMonthInput);
    expiryInput.append(this.expiryYearInput);

  }

  // Use single text field input for card expiry
  else {
    expiryInput = $("<div></div>");
    // Ensure the expiry month is hidden
    if (this.expiryMonthInput.attr("type") !== "hidden") {
      this.expiryMonthInput.attr("type", "hidden");
    }
    // Ensure the expiry year is hidden
    if (this.expiryYearInput.attr("type") !== "hidden") {
      this.expiryYearInput.attr("type", "hidden");
    }

    // Construct the single expiry input for both expiry month and year
    this.expiryMonthYearInput = PaymentForm.detachOrCreateElement(this.elem, ".expiry", "<input class='expiry' />");
    // Ensure the expiry input has a placeholder
    if (!PaymentForm.elementHasAttribute(this.expiryMonthYearInput, "placeholder")) {
      this.expiryMonthYearInput.attr("placeholder", PaymentForm.EXPIRY_PLACEHOLDER);
    }
    this.expiryMonthYearInput.attr("type", "tel");
    this.expiryMonthYearInput.attr("maxlength", PaymentForm.EXPIRY_MASK.length);
    this.expiryMonthYearInput.attr("x-autocompletetype", "cc-exp");
    this.expiryMonthYearInput.attr("autocompletetype", "cc-exp");
    this.expiryMonthYearInput.attr("autocorrect", "off");
    this.expiryMonthYearInput.attr("spellcheck", "off");
    this.expiryMonthYearInput.attr("autocapitalize", "off");

    // Events
    let $this = this;
    this.expiryMonthYearInput.keydown(function (e) {
      PaymentForm.handleMaskedNumberInputKey(e, PaymentForm.EXPIRY_MASK);
      let val = $this.expiryMonthYearInput.val();

      if (val.length === 1 && parseInt(val) > 1 && PaymentForm.keyIsNumber(e)) {
        $this.expiryMonthYearInput.val(PaymentForm.applyFormatMask("0" + val, PaymentForm.EXPIRY_MASK));
      }

      if (!$this.EXPIRY_USE_DROPDOWNS && $this.expiryMonthYearInput != null) {
        $this.expiryMonthInput.val($this.expiryMonth());
        $this.expiryYearInput.val(val.length === 7 ? val.substr(5, 2) : null);
      }
    });

    // When autocomplete in browser apply the if
    this.expiryMonthYearInput.blur(function (e) {
      const val = $this.expiryMonthYearInput.val();

      if (val.length === 5) {
        $this.expiryMonthInput.val(val.substr(0, 2));
        $this.expiryYearInput.val(val.substr(3, 2));
        $this.expiryMonthYearInput.val(val.substr(0, 2) + " / " + val.substr(3, 2))
      }

      $this.refreshExpiryMonthValidation();
    });
    this.expiryMonthYearInput.on('paste', function () {
      setTimeout(function () {
        $this.refreshExpiryMonthYearInput();
      }, 1);
    });

    expiryInput.append(this.expiryMonthYearInput);
    expiryInput.append(this.expiryMonthInput);
    expiryInput.append(this.expiryYearInput);
  }

  wrapper.append(expiryInput);
  expiryInput.append("<div class='icon'></div>");
  expiryInput.find(".icon").append(PaymentForm.CALENDAR_SVG);
};

PaymentForm.prototype.setupCvcInput = function () {
  this.elem.append("<div class='cvc-container'><div class='cvc-wrapper'></div></div>");
  let wrapper = this.elem.find(".cvc-wrapper");
  wrapper.append(this.cvcInput);
  wrapper.append("<div class='icon'></div>");
  wrapper.find(".icon").append(PaymentForm.LOCK_SVG);

  // Events
  let $this = this;
  this.cvcInput.keydown(PaymentForm.filterNumberOnlyKey);
  this.cvcInput.blur(function () {
    $this.refreshCvcValidation();
  });
  this.cvcInput.on('paste', function () {
    setTimeout(function () {
      $this.refreshCvc();
    }, 1);
  });
};

PaymentForm.prototype.setupFiscalNumberInput = function () {
  let card = this.elem.find(".card-number-wrapper");
  card.after("<div class='fiscal-number-wrapper'></div>");
  let wrapper = this.elem.find(".fiscal-number-wrapper");
  wrapper.append(this.fiscalNumberInput);
  wrapper.append("<div class='icon'></div>");
  wrapper.find(".icon").append(PaymentForm.USER_SVG);

  // Events for fiscalNumberInput
  let $this = this;
  this.fiscalNumberInput.blur(function () {
    $this.refreshFiscalNumberValidation();
  });
};

PaymentForm.prototype.setupNipInput = function () {
  let fiscal = this.elem.find(".fiscal-number-wrapper");
  fiscal.after("<div class='nip-wrapper'></div>");
  let wrapper = this.elem.find(".nip-wrapper");
  wrapper.append(this.nipInput);
  wrapper.append("<div class='icon'></div>");
  wrapper.find(".icon").append(PaymentForm.LOCK_SVG);

  // Events for nipInput
  let $this = this;
  wrapper.click(function () {
    if ($this.virtualKeyboardAdded()) {
      $this.removeVirtualKeyboard();
    } else if (!$this.virtualKeyboardAdded() && $this.USE_VIRTUAL_KEYBOARD) {
      $this.addVirtualKeyboard();
    }
  });
  this.nipInput.keydown(PaymentForm.filterNumberOnlyKey);
  this.nipInput.on('paste', function () {
    setTimeout(function () {
      $this.refreshNip();
    }, 1);
  });
  this.nipInput.blur(function () {
    $this.refreshNipValidation();
  });

};

PaymentForm.prototype.setupOtpValidation = function () {
  let wrapper = PaymentForm.detachOrCreateElement(this.elem, ".otp-wrapper", "<div class='otp-wrapper'></div>");
  let label = PaymentForm.detachOrCreateElement(this.elem, ".otp-label", "<label class='otp-label'></label>");
  label.attr("for", 'otp-option');
  if (Payment.IS_CHECKOUT) {
    label.append(PaymentForm.OTP_PLACEHOLDER_CHECKOUT);
  } else {
    label.append(PaymentForm.OTP_PLACEHOLDER_ADD);
  }
  wrapper.append(this.otpValidation);
  wrapper.append(label);
  this.elem.append(wrapper);

  // Events
  let $this = this;
  this.otpValidation.click(function (e) {
    $this.refreshValidationOption();
  });
};

PaymentForm.prototype.setupVirtualKeyboard = function () {
  let array = PaymentForm.generateRandoms();
  let beforeWrapper = this.elem.find(".nip-wrapper");

  if (this.USE_OTP) {
    beforeWrapper = this.elem.find(".otp-wrapper");
  }

  let wrapper = PaymentForm.detachOrCreateElement(this.elem, ".keyboard-wrapper", "<div class='keyboard-wrapper'></div>");
  let $this = this;
  for (let i = 0; i < array.length; i++) {
    let keyContainer = document.createElement('div');
    keyContainer.setAttribute('class', 'key-container');
    let button = document.createElement('button');
    button.setAttribute('class', 'key');
    let value = i + 1;
    if ((i + 1) <= 9) {
      button.setAttribute('value', value);
    } else {
      button.setAttribute('value', 0);
    }
    let span = document.createElement('span');
    let key = document.createTextNode(array[i]);
    span.append(key);
    button.append(span);
    button.addEventListener("click", function (e) {
      $this.addValueToNip(this.value, this.firstChild.innerHTML);
      e.preventDefault();
    });
    keyContainer.append(button);
    wrapper.append(keyContainer);
  }
  let cleanContainer = document.createElement('div');
  cleanContainer.setAttribute('class', 'clean-container');
  let cleanButton = document.createElement('button');
  cleanButton.setAttribute('class', 'clean');
  let cleanKey = document.createTextNode('Borrar');
  cleanButton.append(cleanKey);
  cleanButton.addEventListener("click", function (e) {
    $this.cleanNipInput();
    e.preventDefault();
  });
  cleanContainer.append(cleanButton);
  wrapper.append(cleanContainer);
  beforeWrapper.after(wrapper);
};

PaymentForm.prototype.setupValidationMessage = function () {
  let wrapper = PaymentForm.detachOrCreateElement(this.elem, ".validation-message", "<div class='validation-message'></div>");
  wrapper.addClass('payment_dialog_success');
  if (Payment.IS_CHECKOUT) {
    wrapper.text(PaymentForm.OTP_EXPLICATION_CHECKOUT);
  } else {
    wrapper.text(PaymentForm.OTP_EXPLICATION_ADD);
  }
  this.validationMessage = wrapper;
  this.elem.append(wrapper);
};

PaymentForm.prototype.setupWarningMessage = function () {
  let wrapper = PaymentForm.detachOrCreateElement(this.elem, ".warning-message", "<div class='warning-message'></div>");
  wrapper.addClass('payment_dialog_warning');
  if (this.invalidCardTypeMessage) {
    wrapper.text(this.invalidCardTypeMessage);
  } else {
    wrapper.text(PaymentForm.INVALID_CARD_TYPE_MESSAGE);
  }
  this.warningMessage = wrapper;
  this.elem.append(wrapper);
};

PaymentForm.prototype.setupVerificationInput = function () {
  this.elem.append("<div class='verification-container'><div class='verification-wrapper'></div><div class='verification-btn-wrapper'></div></div>");

  let container = this.elem.find(".verification-btn-wrapper");
  container.append(this.verificationBtn);

  let wrapper = this.elem.find(".verification-wrapper");
  wrapper.append(this.verificationInput);
  wrapper.append("<div class='icon'></div>");
  wrapper.find(".icon").append(PaymentForm.LOCK_SVG);

  // Events
  let $this = this;
  this.verificationInput.keydown(PaymentForm.filterNumberOnlyKey);
  this.verificationInput.blur(function () {
    $this.refreshVerificationInputValidation();
  });
  this.verificationInput.on('keyup', function () {
    $this.refreshVerificationInputValidation();
  });
  this.verificationInput.on('paste', function () {
    setTimeout(function () {
      $this.refreshVerificationInput();
    }, 1);
  });
  this.verificationBtn.on('click', function () {
    $this.verifyTransaction();
  });
};

PaymentForm.prototype.expiryMonth = function () {
  if (!this.EXPIRY_USE_DROPDOWNS && this.expiryMonthYearInput != null) {
    let val = this.expiryMonthYearInput.val();
    return val.length >= 2 ? parseInt(val.substr(0, 2)) : null;
  }
  return null;
};

PaymentForm.prototype.setupBillingAddress = function () {
  // Validate if is required setup the form
  if (!this.captureBillingAddress) return

  this.elem.append("<div class='billing-address-container'></div>");
  let container = this.elem.find(".billing-address-container");

  container.append(`<p><span>${this.__('billingAddressRequired')}</span></p>`);

  container.append("<div class='billing-address-wrapper'></div>");
  let wrapper = container.find(".billing-address-wrapper");
  wrapper.append(this.billingAddressCountry);
  wrapper.append(this.billingAddressState);
  wrapper.append("<div class='icon'><img class='flag'/></div>");
  this.billingAddressCountryFlag = wrapper.find(".flag")[0];

  container.append("<div class='billing-address-wrapper1'></div>");
  let wrapper1 = container.find(".billing-address-wrapper1");
  wrapper1.append(this.billingAddressCity);
  wrapper1.append(this.billingAddressDistrict);

  container.append("<div class='billing-address-wrapper2'></div>");
  let wrapper2 = container.find(".billing-address-wrapper2");
  wrapper2.append(this.billingAddressZip);
  wrapper2.append(this.billingAddressStreet);

  container.append("<div class='billing-address-wrapper3'></div>");
  let wrapper3 = container.find(".billing-address-wrapper3");
  wrapper3.append(this.billingAddressHouseNumber);
  wrapper3.append(this.billingAddressAdditional);

  // Events
  let $this = this;
  this.billingAddressCountry.change(function () {
    $this.refreshBillingAddressCountryFlag();
    $this.refreshBillingAddressStateOptions();
  });
  this.billingAddressCountry.blur(function () {
    $this.refreshBillingAddressCountryValidation();
  });
  this.billingAddressState.blur(function () {
    $this.refreshBillingAddressStateValidation();
  });
  this.billingAddressCity.blur(function () {
    $this.refreshBillingAddressCityValidation();
  });
  this.billingAddressDistrict.blur(function () {
    $this.refreshBillingAddressDistrictValidation();
  });
  this.billingAddressZip.blur(function () {
    $this.refreshBillingAddressZipValidation();
  });
  this.billingAddressStreet.blur(function () {
    $this.refreshBillingAddressStreetValidation();
  });
  this.billingAddressHouseNumber.blur(function () {
    $this.refreshBillingAddressHouseNumberValidation();
  });
  this.billingAddressAdditional.blur(function () {
    $this.refreshBillingAddressAdditionalValidation();
  });
};

PaymentForm.prototype.createUniqueName = function (prefix) {
  return `${prefix}${PaymentForm.generateRandoms().join("").slice(4)}`;
}

PaymentForm.prototype.setupPocketTypeAmount = function (pocketTypeItemSelectWrapper, index) {
  const cPTAmountInput = this.pocketTypes.items[index].amount = PaymentForm.detachOrCreateElement(
    this.elem,
    '.pocketTypeAmount',
    `<input class='pocket-type-amount' />`
  );

  pocketTypeItemSelectWrapper.append(cPTAmountInput);

  cPTAmountInput.attr({
    name: this.createUniqueName("pocket-type-amount-"),
    placeholder: this.__('pocketTypeAmount'),
    type: "number",
    autocorrect: "off",
    spellcheck: "off",
    min: 0,
    autocapitalize: "off",
  });

  cPTAmountInput.keydown(PaymentForm.filterNumberOnlyKey);
  cPTAmountInput.blur(() => {
    this.setSumOfPocketsAmountFields();
    this.refreshPocketTypeAmountValidation(index);
  });
}

PaymentForm.prototype.updateAvaliableOptions = function (value) {
  const { pocketTypes } = this;
  const { availableOptions, optionsType, configurationOptions } = pocketTypes;
  const usedOptions = pocketTypes.items.map((item) => {
    return item.selectController.getValue();
  });
  const newAvaliableOptions = configurationOptions.filter((currentOption) => {
    return !usedOptions.includes(currentOption);
  });
  availableOptions.clear();
  newAvaliableOptions.forEach(item => availableOptions.add(item));

}

PaymentForm.prototype.extractPocketTotalAmoutFormBtnString = function (string = "") {
  if (!string) return null;
  var cur_re = /\D*(\d+|\d.*?\d)(?:\D+(\d{2}))?\D*$/;
  var parts = cur_re.exec(string);
  var number = parseFloat(parts[1].replace(/\D/, '') + '.' + (parts[2] ? parts[2] : '00'));
  return number.toFixed(2);
}


PaymentForm.prototype.setSumOfPocketsAmountFields = function () {
  const { pocketTypes: { items: pocketTypesItems } } = this;
  const totalPocketFieldsSum = pocketTypesItems.reduce((acc, item, index) => {
    const current = this.getPocketTypeAmount(index);
    if (isNaN(current)) {
      return acc;
    }
    acc += current;
    return acc;
  }, 0);
  this.pocketTypes.totalPocketFieldsSum = totalPocketFieldsSum;
}

PaymentForm.prototype.getSumOfPocketsAmountFields = function () {
  return this.pocketTypes.totalPocketFieldsSum;
}

PaymentForm.prototype.setPocketTypesTotalAmount = function (amountText = "") {
  const amount = this.extractPocketTotalAmoutFormBtnString(amountText);
  this.pocketTypes.totalAmount = amount;
}

PaymentForm.prototype.getPocketTotalAmout = function () {
  return this.pocketTypes.totalAmount;
}

PaymentForm.prototype.updatePocketsLabel = function (data = {}) {

  if (this.isPocketTypeAdded()) {

    const { type = "init" } = data;

    const paymentBtn = $(".payment-button-popup");
    const label = $(".pocketTypeAmountLabelText");

    $this = this;

    if (paymentBtn.length > 0) {
      const totalPocketFieldsSum = $this.getSumOfPocketsAmountFields();
      let totalAmount = $this.getPocketTotalAmout();
      switch (type) {
        case "init":
          label.removeClass("hidden");
          $this.setPocketTypesTotalAmount(paymentBtn.text());
          totalAmount = $this.getPocketTotalAmout();
          break;
        case "error":
          this.enablePocketTypesBtns();
        case "remove":
        case "validate":
          if (totalPocketFieldsSum > totalAmount) {
            label.removeClass("valid").addClass("error");
          } else if (totalPocketFieldsSum == totalAmount) {
            label.removeClass("error").addClass("valid");
          } else {
            label.removeClass("error").removeClass("valid");
          };
          break;
        case "globalValidation":
          if (totalPocketFieldsSum == totalAmount) {
            $this.disablePocketTypesBtns();
            return true;
          }
          label.removeClass("valid").addClass("error");
          return false;
        default:
          break;
      }
      const formatter = new Intl.NumberFormat("es-CO", {
        style: 'currency',
        currency: "COP",
      });

      const pocketsLabel = formatter.format(totalPocketFieldsSum) + " de " + formatter.format(totalAmount);
      label.text(pocketsLabel);
    }
  }
}

PaymentForm.prototype.updatePocketTypeSelectsState = function (action = "remove") {
  const pocketTypesItems = this.pocketTypes.items;
  const numItems = pocketTypesItems.length;

  const indexOfActiveElm = action === "remove" ? numItems - 2 : numItems - 1;
  for (let i = 0; i < numItems; i++) {
    pocketTypesItems[i].selectController.$control.addClass('disabled');
    if (i === indexOfActiveElm) {
      pocketTypesItems[i].selectController.$control.removeClass('disabled');
    }
  }
};

PaymentForm.prototype.setupPocketTypeSelect = function (pocketTypeItemSelectWrapper, index) {
  $this = this;
  const { pocketTypes } = $this;
  const { items } = pocketTypes;
  const pocketTypeItem = items[index];
  const cPTSelectField = pocketTypeItem.select = PaymentForm.detachOrCreateElement(
    this.elem,
    ".pocketTypeSelect",
    "<select class='pocket-type-select' />"
  );

  pocketTypeItemSelectWrapper.append(cPTSelectField);

  const options = pocketTypes.options.filter(function (option) {
    return pocketTypes.availableOptions.has(option.code);
  });


  cPTSelectField
    .attr("placeholder", this.__('pocketTypeSelect'))
    .attr("name", this.createUniqueName("pocket-type-select-"))
    .selectize({
      valueField: 'code',
      labelField: 'name',
      searchField: 'name',
      options: options,
      hideSelected: true,
      onInitialize: function () {
        pocketTypeItem.selectController = this;
        this.setValue(options[0].code);
      },
      onChange: function (value, a, b, c) {
        pocketTypeItemSelectWrapper.attr("data-type", pocketTypes.optionsType[value]);
        $this.updateAvaliableOptions(value);
        $this.refreshPocketTypeSelectValidation(index);
      }
    });

  this.updatePocketTypeSelectsState("add");

};

PaymentForm.prototype.setupPocketTypeInstallments = function (pocketTypeItemSelectWrapper, index) {
  const cPTInstallments = this.pocketTypes.items[index]["installments"] = PaymentForm.detachOrCreateElement(
    this.elem, '.pocketTypeInstallments',
    "<select class='pocket-type-installments' />"
  );
  const installmentsOptions = Array.from({ length: 48 }, (_, i) => i + 1);
  this.setInstallmentsOptions(installmentsOptions, cPTInstallments, false);
  cPTInstallments.attr("name", this.createUniqueName("pocket-type-installments-"));
  pocketTypeItemSelectWrapper.append(cPTInstallments);
}

PaymentForm.prototype.updatePocketTypeRemoveButtonsState = function (action = "remove") {
  const pocketTypesItems = this.pocketTypes.items;
  const numItems = pocketTypesItems.length;
  const indexOfActiveButton = numItems - 1;
  if (action === "add") {
    const beforeLastBtnIndex = indexOfActiveButton - 1;
    if (numItems > 2) {
      pocketTypesItems[beforeLastBtnIndex].button.addClass('disabled');
    };
  }
  if (numItems > 1) {
    pocketTypesItems[indexOfActiveButton].button.removeClass('disabled');
  }
};

PaymentForm.prototype.setupPocketTypeButton = function (pocketTypeItemSelectWrapper, index) {
  const pocketTypesItems = this.pocketTypes.items;

  const cPTAmountButton = pocketTypesItems[index].button = PaymentForm.detachOrCreateElement(
    this.elem,
    '.pocketTypeButton',
    `<span class='pocket-type-button pocket-type-button-remove disabled'>
      <span class='icon icon-remove'>${PaymentForm.REMOVE_SVG}</span>
    </span>`
  );

  this.updatePocketTypeRemoveButtonsState("add");

  cPTAmountButton.click(function (event) {
    this.updatePocketTypeSelectsState("remove");
    const currentIndex = [...document.querySelectorAll('.pocket-type-item')].indexOf(event.target.parentNode);
    this.removePocketTypeItem(currentIndex);
  }.bind(this));
  pocketTypeItemSelectWrapper.append(cPTAmountButton);
};

PaymentForm.prototype.removePocketTypeItem = function (index) {
  this.pocketTypes.availableOptions.add(this.pocketTypes.items[index].selectController.getValue());
  this.pocketTypes.items[index].selectController.destroy();
  this.elem.find(".pocket-type-item").eq(index).remove()
  this.pocketTypes.items.splice(index, 1);
  if (this.pocketTypes.items.length <= 1) {
    $this.elem.find(".pocket-type-button-remove").addClass("disabled");
  }
  if (this.pocketTypes.items.length <= 3) {
    $this.pocketTypes.addButton.removeClass("disabled");
  };
  this.updatePocketTypeRemoveButtonsState("remove");
  this.updatePocketsLabel({ type: "remove" });
}

PaymentForm.prototype.createPocketTypeItem = function (pocketTypeIndex) {
  const availableOptions = this.pocketTypes.availableOptions;
  const selectedOptions = this.pocketTypes.items.map(item => item.selectController.getValue());

  selectedOptions.forEach(option => availableOptions.delete(option));
  const pocketTypeItemSelectWrapper = $("<div>", { class: "pocket-type-item" })
    .appendTo(this.elem.find(".pocket-type-items-container"));
  this.pocketTypes.items[pocketTypeIndex] = {
    amount: null,
    select: null,
    selectController: null,
    installments: null,
    button: null,
  };

  this.setupPocketTypeAmount(pocketTypeItemSelectWrapper, pocketTypeIndex);
  this.setupPocketTypeSelect(pocketTypeItemSelectWrapper, pocketTypeIndex);
  this.setupPocketTypeInstallments(pocketTypeItemSelectWrapper, pocketTypeIndex);
  this.setupPocketTypeButton(pocketTypeItemSelectWrapper, pocketTypeIndex);
};

PaymentForm.prototype.setupPocketTypeContainer = function () {

  const { pocketTypes, configuration } = this;
  this.pocketTypes.init = true;
  $this = this;

  const options = Object.values(configuration)
    .flatMap(config => Object.keys(config.type_pockets))
    .sort();

  pocketTypes.availableOptions = new Set(options);
  pocketTypes.optionsType = Object.keys(configuration).reduce((result, key) => {
    const currentFields = configuration[key].type_pockets;
    return { ...result, ...currentFields };
  }, {});

  pocketTypes.configurationOptions = Object.keys(pocketTypes.optionsType).map(key => key);

  const pocketTypeContainer = $("<div>", { class: "pocket-type-container" });
  pocketTypeContainer.append(`
    <p><span>${this.__("pocketTypeRequired")}</span></p>
    <div class="pocket-type-items-container"></div>
  `);

  this.elem.append(pocketTypeContainer);

  this.createPocketTypeItem(0);

  pocketTypeContainer.append(`
    <div class="pocket-type-footer">
      <div class="pocketTypeAmountLabel ">
        <span class="pocketTypeAmountLabelText hidden"></span>
      </div>
      <div class="pocket-type-add-item">
        <span class="pocket-type-button pocket-type-button-add">
          <span class="icon icon-add">${PaymentForm.ADD_SVG}</span>
          <span>${this.__("pocketTypeAddLabel")}</span>
        </span>
      </div>
    </div>
  `);

  this.pocketTypes.addButton = pocketTypeContainer
    .find(".pocket-type-button-add")
    .on("click", () => {
      const existingSelects = pocketTypes.items.length;
      const availableOptions = pocketTypes.availableOptions.size;
      if (existingSelects <= 4 || availableOptions >= 1) {
        if (existingSelects >= 4 || availableOptions <= 1) {
          $this.pocketTypes.addButton.addClass("disabled");
        }
        const isLastSelectValid = $this.refreshPocketTypeSelectValidation(existingSelects - 1);
        isLastSelectValid && $this.createPocketTypeItem(pocketTypes.items.length);
      }
    });
  this.updatePocketsLabel({ type: "init" });

};

// ==========================================================================================

/**
 * Refresh whether the expiry month is valid (update display to reflect)
 */
PaymentForm.prototype.refreshExpiryMonthValidation = function () {
  if (this.expiryContainerAdded()) {
    if (PaymentForm.isExpiryValid(this.getExpiryMonth(), this.getExpiryYear())) {
      this.setExpiryMonthAsValid();
      return true;
    } else {
      this.setExpiryMonthAsInvalid();
      return false;
    }
  } else {
    return true;
  }
};

/**
 * Update the display to highlight the expiry month as valid.
 */
PaymentForm.prototype.setExpiryMonthAsValid = function () {
  if (this.EXPIRY_USE_DROPDOWNS) {
    this.expiryMonthInput.parent().removeClass("has-error");
  } else {
    this.expiryMonthYearInput.parent().removeClass("has-error");
  }
};

/**
 * Update the display to highlight the expiry month as invalid.
 */
PaymentForm.prototype.setExpiryMonthAsInvalid = function () {
  if (this.EXPIRY_USE_DROPDOWNS) {
    this.expiryMonthInput.parent().addClass("has-error");
  } else {
    this.expiryMonthYearInput.parent().addClass("has-error");
  }
};

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

/**
 * Does the given element have an attribute with the given attribute name
 *
 * @param element
 * @param attributeName
 * @returns {boolean}
 */
PaymentForm.elementHasAttribute = function (element, attributeName) {
  let attr = $(element).attr(attributeName);
  return typeof attr !== typeof undefined && attr !== false;
};

/**
 * Detach an element if it exists, or create a new one if it doesn't.
 *
 * @param parentElement
 * @param selector
 * @param html
 * @returns {*}
 */
PaymentForm.detachOrCreateElement = function (parentElement, selector, html) {
  let element = parentElement.find(selector);
  if (element[0]) {
    element.detach();
  } else {
    element = $(html);
  }
  return element;
};

/**
 * Is the given month a valid month?
 *
 * @param expiryMonth
 * @returns {boolean}
 */
PaymentForm.isValidMonth = function (expiryMonth) {
  return (expiryMonth >= 1 && expiryMonth <= 12);
};

/**
 * Is the given card expiry (month and year) valid?
 *
 * @param month
 * @param year
 * @returns {boolean}
 */
PaymentForm.isExpiryValid = function (month, year) {
  let today = new Date();
  let currentMonth = (today.getMonth() + 1);
  let currentYear = "" + today.getFullYear();

  if (("" + year).length === 2) {
    year = currentYear.substring(0, 2) + "" + year;
  }

  currentMonth = parseInt(currentMonth);
  currentYear = parseInt(currentYear);
  month = parseInt(month);
  year = parseInt(year);

  return PaymentForm.isValidMonth(month) && ((year > currentYear) || (year === currentYear && month >= currentMonth));
};
