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
  this.cardType = '';
  this.numberBin = '';
  this.nip = '';
  this.USE_OTP = false;
  this.brand_name = '';
  this.isBloqued = false;
  this.useLunh = true;

  // Validate if its displaying in a mobile device
  this.IS_MOBILE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  this.USE_VIRTUAL_KEYBOARD = !this.IS_MOBILE;

  this.captureEmail = this.elem.data("capture-email") ? this.elem.data("capture-email") : false;
  this.captureCellPhone = this.elem.data("capture-cellphone") ? this.elem.data("capture-cellphone") : false;
  this.captureName = this.elem.data("capture-name") ? this.elem.data("capture-name") : false;
  this.iconColour = this.elem.data("icon-colour") ? this.elem.data("icon-colour") : false;
  this.EXPIRY_USE_DROPDOWNS = this.elem.data("use-dropdowns") ? this.elem.data("use-dropdowns") : false;
  this.exclusiveTypes = this.elem.data("exclusive-types") ? this.elem.data("exclusive-types").split(",") : false;
  this.invalidCardTypeMessage = this.elem.data("invalid-card-type-message") ? this.elem.data("invalid-card-type-message") : false;

  // initialize
  this.cvcLenght = 3;
  this.nipLenght = 4;
  this.initEmailInput();
  this.initCellPhoneInput();
  this.initNameInput();
  this.initCardNumberInput();
  this.initExpiryMonthInput();
  this.initExpiryYearInput();
  this.initCvcInput();

  this.elem.empty();

  // Setup display
  this.setupEmailInput();
  this.setupCellPhoneInput();
  this.setupNameInput();
  this.setupCardNumberInput();
  this.setupExpiryInput();
  this.setupCvcInput();

  this.elem.append(this.current_data);

  // Set icon colour
  if (this.iconColour) {
    this.setIconColour(this.iconColour);
  }

  this.refreshCreditCardType();
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
PaymentForm.CREDIT_CARD_NUMBER_PLACEHOLDER = "Número de tarjeta";
PaymentForm.NAME_PLACEHOLDER = "Nombre del titular";
PaymentForm.EMAIL_PLACEHOLDER = "E-mail";
PaymentForm.CELLPHONE_PLACEHOLDER = "Celular";
PaymentForm.FISCAL_NUMBER_PLACEHOLDER = "Documento de Identificación";
PaymentForm.EXPIRY_PLACEHOLDER = "MM / YY";
PaymentForm.EXPIRY_NUMBER_OF_YEARS = 10;
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

PaymentForm.prototype.cardTypeFromNumberBin = function (number) {
  let number_bin = number.replace(" ", "").substring(0, 6);
  if (number >= 6 && this.numberBin !== number_bin) {
    this.numberBin = number_bin;
    Payment.getBinInformation(number_bin, this, this.successCallback, function (error) {
    });
  }
};

PaymentForm.prototype.successCallback = function (objResponse, form) {
  // Set luhn flag
  form.useLunh = objResponse.use_luhn;

  // Set card type
  form.cardType = objResponse.card_type.length > 0 ? objResponse.card_type : '';
  form.brand_name = objResponse.brand_name.length > 0 ? objResponse.brand_name : '';
  // Set card type icon
  $(".card-type-icon").css("background-image", "url(" + objResponse.url_logo + ")");

  // // Set card mask
  form.creditCardNumberMask = objResponse.card_mask ? objResponse.card_mask : "XXXX XXXX XXXX XXXX";
  form.cardNumberInput.attr("maxlength", form.creditCardNumberMask.length);

  form.setInstallmentsOptions(objResponse.installments_options);

  // Set use of otp
  form.USE_OTP = objResponse.otp;
  // form.USE_OTP = false;

  if (form.cardType === 'sx' || form.cardType === 'vr') {
    form.removeTuyaChanges();
    form.addFiscalNumber();
  }
  // Tuya requirements
  else if (form.cardType === 'ex' || form.cardType === 'ak') {
    form.addTuyaChanges();
  } else {
    form.removeTuyaChanges();
    // Set cvc lenght and cvc mask
    form.cvcLenght = objResponse.cvv_length;
    form.cvcInput.attr("maxlength", form.cvcLenght);
    form.cvcMask = "X".repeat(form.cvcLenght);
  }

  // Validate if card type is valid.
  if (form.exclusiveTypes) {
    let is_valid_type = false;
    form.exclusiveTypes.forEach(function (type) {
      if (form.cardType === type) {
        is_valid_type = true;
      }
    });

    if (!is_valid_type) {
      form.blockForm();
    } else if (is_valid_type && form.isBloqued) {
      form.unBlockForm();
    }
  }
};

/**
 * Set the installments if this exists
 *
 * @param installments - array
 */
PaymentForm.prototype.setInstallmentsOptions = function (installments) {
  let selectInstallments = $(".installments");
  selectInstallments.empty();
  $.each(installments, function (option, value) {
    selectInstallments.append($("<option></option>").attr("value", value).text(value));
  });
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
 *
 *
 * @param e
 * @param cardMask
 */
PaymentForm.handleCreditCardNumberKey = function (e, cardMask) {
  PaymentForm.handleMaskedNumberInputKey(e, cardMask);
};

PaymentForm.handleCreditCardNumberChange = function (e) {
};

PaymentForm.handleExpiryKey = function (e) {
  PaymentForm.handleMaskedNumberInputKey(e, PaymentForm.EXPIRY_MASK);
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
  return is_date_valid && is_cvc_valid && is_card_holder_valid && is_card_number_valid
    && is_email_valid && is_cellphone_valid && is_fiscal_number_valid && is_nip_valid;
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
    return this.getCellPhone() != null && this.getCellPhone().length >= 5;
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
  if (this.fiscalNumberAdded())
    return this.getFiscalNumber() != null && this.getFiscalNumber().length >= 6;
  else
    return true
};

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
 * Get the card object.
 *
 * @returns {object}
 */
PaymentForm.prototype.getCard = function () {
  let data = null;
  if (this.isValidData()) {
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
        "type": this.cardType,
        "cvc": this.getCvc(),
        "nip": this.getNip(),
        "card_auth": this.getValidationOption(),
      }
    };
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
  return this.cellPhoneInput.val();
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
  if (this.cardType === 'ex' || this.cardType === 'ak') {
    if (this.USE_OTP) {
      if (this.otpValidation.is(':checked')) {
        val = PaymentForm.AUTH_OTP;
      } else {
        val = PaymentForm.AUTH_NIP;
      }
    } else {
      val = PaymentForm.AUTH_NIP;
    }
  } else {
    val = PaymentForm.AUTH_CVC;
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

// --- --- --- --- --- --- --- --- --- --- ---

/**
 * Reset the form and disable the initial inputs
 *
 * @returns {string}
 */
PaymentForm.prototype.blockForm = function () {
  this.isBloqued = true;

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
  this.isBloqued = false;

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
  this.elem.find(".icon .svg").css({"fill": colour});
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
  let numbersOnly = PaymentForm.numbersOnlyString($(this.cvcInput).val());
  let formattedNumber = PaymentForm.applyFormatMask(numbersOnly, this.creditCardNumberMask);
  $(this.cvcInput).val(formattedNumber);
};

/**
 *
 */
PaymentForm.prototype.refreshNip = function () {
  let numbersOnly = PaymentForm.numbersOnlyString($(this.nipInput).val());
  let formattedNumber = PaymentForm.applyFormatMask(numbersOnly, this.creditCardNumberMask);
  $(this.nipInput).val(formattedNumber);
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
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
/**
 * The next methods are temporary because only exito use otp and nip
 */
PaymentForm.prototype.addTuyaChanges = function () {
  this.addFiscalNumber();
  this.addNip();
  this.addOtpValidation();
  this.removeExpiryContainer();
  this.removeCvcContainer();
};

PaymentForm.prototype.removeTuyaChanges = function () {
  this.addExpiryContainer();
  this.addCvcContainer();
  this.removeFiscalNumber();
  this.removeNip();
  this.removeOtpValidation();
  this.removeVirtualKeyboard();
  this.removeValidationMessage();
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
  this.cellPhoneInput = PaymentForm.detachOrCreateElement(this.elem, ".cellphone", "<input class='cellphone' />");
  // Ensure the cellphone element has a field cellphone
  if (!PaymentForm.elementHasAttribute(this.cellPhoneInput, "name")) {
    this.cellPhoneInput.attr("name", "cellphone");
  }
  // Ensure the cellphone element has a placeholder
  if (!PaymentForm.elementHasAttribute(this.cellPhoneInput, "placeholder")) {
    this.cellPhoneInput.attr("placeholder", PaymentForm.CELLPHONE_PLACEHOLDER);
  }
  this.cellPhoneInput.attr("type", "tel");
  this.cellPhoneInput.attr("autocorrect", "off");
  this.cellPhoneInput.attr("spellcheck", "off");
  this.cellPhoneInput.attr("autocapitalize", "off");
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
  this.fiscalNumberInput.attr("type", "tel");
  this.fiscalNumberInput.attr("pattern", "[0-9]*");
  this.fiscalNumberInput.attr("inputmode", "numeric");
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
    PaymentForm.handleCreditCardNumberKey(e, $this.creditCardNumberMask);
  });
  this.cardNumberInput.keyup(function () {
    $this.refreshCreditCardType();
  });
  //this.cardNumberInput.change(PaymentForm.handleCreditCardNumberChange);
  this.cardNumberInput.on('paste', function () {
    setTimeout(function () {
      $this.refreshCreditCardNumberFormat();
      $this.refreshCreditCardType();
    }, 1);
  });
  this.cardNumberInput.blur(function () {
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
  }
};

PaymentForm.prototype.setupEmailInput = function () {
  if (this.captureEmail) {
    this.elem.append("<div class='email-container'><div class='email-wrapper'></div></div>");
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
    wrapper.append(this.cellPhoneInput);
    wrapper.append("<div class='icon'></div>");
    wrapper.find(".icon").append(PaymentForm.CELLPHONE_SVG);

    // Events
    let $this = this;
    this.cellPhoneInput.blur(function () {
      $this.refreshCellPhoneValidation();
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
      PaymentForm.handleExpiryKey(e);
      let val = $this.expiryMonthYearInput.val();

      if (val.length === 1 && parseInt(val) > 1 && PaymentForm.keyIsNumber(e)) {
        $this.expiryMonthYearInput.val(PaymentForm.applyFormatMask("0" + val, PaymentForm.EXPIRY_MASK));
      }

      if (!$this.EXPIRY_USE_DROPDOWNS && $this.expiryMonthYearInput != null) {
        $this.expiryMonthInput.val($this.expiryMonth());
        $this.expiryYearInput.val(val.length === 7 ? val.substr(5, 2) : null);
      }
    });
    this.expiryMonthYearInput.blur(function () {
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
  wrapper.append("<div class='icon'></div>");
  wrapper.find(".icon").append(PaymentForm.CALENDAR_SVG);
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
  this.fiscalNumberInput.keydown(PaymentForm.filterNumberOnlyKey);
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

PaymentForm.prototype.expiryMonth = function () {
  if (!this.EXPIRY_USE_DROPDOWNS && this.expiryMonthYearInput != null) {
    let val = this.expiryMonthYearInput.val();
    return val.length >= 2 ? parseInt(val.substr(0, 2)) : null;
  }
  return null;
};

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

