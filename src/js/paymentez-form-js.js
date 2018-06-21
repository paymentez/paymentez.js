PaymentezForm.prototype.constructor = PaymentezForm ;

/**
 * @class PaymentezForm
 *
 * @author Martín Mucito
 *
 * @param elem
 * @constructor
 */

function PaymentezForm(elem) {
  this.elem = jQuery(elem);
  const current_data = this.elem.children("div");
  this.cardType = '';

  this.captureEmail = this.elem.data("capture-email") ? this.elem.data("capture-email") : false;
  this.captureCellPhone = this.elem.data("capture-cellphone") ? this.elem.data("capture-cellphone") : false;
  this.captureName = this.elem.data("capture-name") ? this.elem.data("capture-name") : false;
  this.iconColour = this.elem.data("icon-colour") ? this.elem.data("icon-colour") : false;

  // Initialise
  this.cvcLenght = 3;
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
  
  this.elem.append(current_data);

  // Set icon colour
  if(this.iconColour) {
    this.setIconColour(this.iconColour);
  }
  // --- --- --- --- --- --- --- --- --- ---

  this.refreshCreditCardTypeIcon();
}

PaymentezForm.KEYS = {
  "0" : 48,
  "9" : 57,
  "NUMPAD_0" : 96,
  "NUMPAD_9" : 105,
  "DELETE" : 46,
  "BACKSPACE" : 8,
  "ARROW_LEFT" : 37,
  "ARROW_RIGHT" : 39,
  "ARROW_UP" : 38,
  "ARROW_DOWN" : 40,
  "HOME" : 36,
  "END" : 35,
  "TAB" : 9,
  "A" : 65,
  "X" : 88,
  "C" : 67,
  "V" : 86
};


PaymentezForm.CREDIT_CARD_NUMBER_DEFAULT_MASK    = "XXXX XXXX XXXX XXXX";
PaymentezForm.CREDIT_CARD_NUMBER_VISA_MASK       = "XXXX XXXX XXXX XXXX";
PaymentezForm.CREDIT_CARD_NUMBER_MASTERCARD_MASK = "XXXX XXXX XXXX XXXX";
PaymentezForm.CREDIT_CARD_NUMBER_DISCOVER_MASK   = "XXXX XXXX XXXX XXXX";
PaymentezForm.CREDIT_CARD_NUMBER_JCB_MASK        = "XXXX XXXX XXXX XXXX";
PaymentezForm.CREDIT_CARD_NUMBER_AMEX_MASK       = "XXXX XXXXXX XXXXX";
PaymentezForm.CREDIT_CARD_NUMBER_DINERS_MASK     = "XXXX XXXX XXXX XX";
PaymentezForm.CREDIT_CARD_NUMBER_EXITO_MASK      = "XXXX XXXX XXXX XXXX";

PaymentezForm.prototype.creditCardNumberMask = PaymentezForm.CREDIT_CARD_NUMBER_DEFAULT_MASK;
PaymentezForm.CREDIT_CARD_NUMBER_PLACEHOLDER = "Número de tarjeta";
PaymentezForm.NAME_PLACEHOLDER =  "Nombre del titular";
PaymentezForm.EMAIL_PLACEHOLDER =  "E-mail";
PaymentezForm.CELLPHONE_PLACEHOLDER =  "Celular";
PaymentezForm.FISCAL_NUMBER_PLACEHOLDER =  "Número fiscal";
PaymentezForm.EXPIRY_MASK = "XX / XX";
PaymentezForm.EXPIRY_PLACEHOLDER = "MM / YY";
PaymentezForm.EXPIRY_USE_DROPDOWNS = false;
PaymentezForm.EXPIRY_NUMBER_OF_YEARS = 10;
PaymentezForm.CVC_MASK_3 = "XXX";
PaymentezForm.CVC_MASK_4 = "XXXX";
PaymentezForm.CVC_PLACEHOLDER =  "CVC";
PaymentezForm.VALIDATION_METHOD_LEGEND =  "Método de validacion";

PaymentezForm.CELLPHONE_SVG = '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="24px" height="17px" x="0px" y="0px" viewBox="0 0 27.442 27.442" style="enable-background:new 0 0 27.442 27.442;" xmlns:xlink="http://www.w3.org/1999/xlink">'+
'<g>'+
'<path class="svg" d="M19.494,0H7.948C6.843,0,5.951,0.896,5.951,1.999v23.446c0,1.102,0.892,1.997,1.997,1.997h11.546'+
'c1.103,0,1.997-0.895,1.997-1.997V1.999C21.491,0.896,20.597,0,19.494,0z M10.872,1.214h5.7c0.144,0,0.261,0.215,0.261,0.481'+
's-0.117,0.482-0.261,0.482h-5.7c-0.145,0-0.26-0.216-0.26-0.482C10.612,1.429,10.727,1.214,10.872,1.214z M13.722,25.469'+
'c-0.703,0-1.275-0.572-1.275-1.276s0.572-1.274,1.275-1.274c0.701,0,1.273,0.57,1.273,1.274S14.423,25.469,13.722,25.469z'+
' M19.995,21.1H7.448V3.373h12.547V21.1z"/>'+
'</g>'+
'</svg>';

PaymentezForm.CREDIT_CARD_SVG = '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
  'x="0px" y="3px" width="24px" height="17px" viewBox="0 0 216 146" enable-background="new 0 0 216 146" xml:space="preserve">' +
  '<g><path class="svg" d="M182.385,14.258c-2.553-2.553-5.621-3.829-9.205-3.829H42.821c-3.585,0-6.653,1.276-9.207,3.829' +
  'c-2.553,2.553-3.829,5.621-3.829,9.206v99.071c0,3.585,1.276,6.654,3.829,9.207c2.554,2.553,5.622,3.829,9.207,3.829H173.18' +
  'c3.584,0,6.652-1.276,9.205-3.829s3.83-5.622,3.83-9.207V23.464C186.215,19.879,184.938,16.811,182.385,14.258z M175.785,122.536' +
  'c0,0.707-0.258,1.317-0.773,1.834c-0.516,0.515-1.127,0.772-1.832,0.772H42.821c-0.706,0-1.317-0.258-1.833-0.773' +
  'c-0.516-0.518-0.774-1.127-0.774-1.834V73h135.571V122.536z M175.785,41.713H40.214v-18.25c0-0.706,0.257-1.316,0.774-1.833' +
  'c0.516-0.515,1.127-0.773,1.833-0.773H173.18c0.705,0,1.316,0.257,1.832,0.773c0.516,0.517,0.773,1.127,0.773,1.833V41.713z"/>' +
  '<rect class="svg" x="50.643" y="104.285" width="20.857" height="10.429"/>' +
  '<rect class="svg" x="81.929" y="104.285" width="31.286" height="10.429"/>'+
  '</g></svg>';


PaymentezForm.LOCK_SVG = '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
  'x="0px" y="3px" width="24px" height="17px" viewBox="0 0 216 146" enable-background="new 0 0 216 146" xml:space="preserve">' +
  '<path class="svg" d="M152.646,70.067c-1.521-1.521-3.367-2.281-5.541-2.281H144.5V52.142c0-9.994-3.585-18.575-10.754-25.745' +
  'c-7.17-7.17-15.751-10.755-25.746-10.755s-18.577,3.585-25.746,10.755C75.084,33.567,71.5,42.148,71.5,52.142v15.644' +
  'h-2.607c-2.172,0-4.019,0.76-5.54,2.281c-1.521,1.52-2.281,3.367-2.281,5.541v46.929c0,2.172,0.76,4.019,2.281,5.54' +
  'c1.521,1.52,3.368,2.281,5.54,2.281h78.214c2.174,0,4.02-0.76,5.541-2.281c1.52-1.521,2.281-3.368,2.281-5.54V75.607' +
  'C154.93,73.435,154.168,71.588,152.646,70.067z M128.857,67.786H87.143V52.142c0-5.757,2.037-10.673,6.111-14.746' +
  'c4.074-4.074,8.989-6.11,14.747-6.11s10.673,2.036,14.746,6.11c4.073,4.073,6.11,8.989,6.11,14.746V67.786z"/></svg>';


PaymentezForm.CALENDAR_SVG = '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
  'x="0px" y="4px" width="24px" height="16px" viewBox="0 0 216 146" enable-background="new 0 0 216 146" xml:space="preserve">' +
  '<path class="svg" d="M172.691,23.953c-2.062-2.064-4.508-3.096-7.332-3.096h-10.428v-7.822c0-3.584-1.277-6.653-3.83-9.206' +
  'c-2.554-2.553-5.621-3.83-9.207-3.83h-5.213c-3.586,0-6.654,1.277-9.207,3.83c-2.554,2.553-3.83,5.622-3.83,9.206' +
  'v7.822H92.359v-7.822c0-3.584-1.277-6.653-3.83-9.206c-2.553-2.553-5.622-3.83-9.207-3.83h-5.214c-3.585,0-6.654,' +
  '1.277-9.207,3.83c-2.553,2.553-3.83,5.622-3.83,9.206v7.822H50.643c-2.825,0-5.269,1.032-7.333,3.096s-3.096,' +
  '4.509-3.096,7.333v104.287c0,2.823,1.032,5.267,3.096,7.332c2.064,2.064,4.508,3.096,7.333,3.096h114.714c2.824,0,' +
  '5.27-1.032,7.332-3.096c2.064-2.064,3.096-4.509,3.096-7.332V31.286C175.785,28.461,174.754,26.017,172.691,23.953z ' +
  'M134.073,13.036c0-0.761,0.243-1.386,0.731-1.874c0.488-0.488,1.113-0.733,1.875-0.733h5.213c0.762,0,1.385,0.244,' +
  '1.875,0.733c0.488,0.489,0.732,1.114,0.732,1.874V36.5c0,0.761-0.244,1.385-0.732,1.874c-0.49,0.488-1.113,' +
  '0.733-1.875,0.733h-5.213c-0.762,0-1.387-0.244-1.875-0.733s-0.731-1.113-0.731-1.874V13.036z M71.501,13.036' +
  'c0-0.761,0.244-1.386,0.733-1.874c0.489-0.488,1.113-0.733,1.874-0.733h5.214c0.761,0,1.386,0.244,1.874,0.733' +
  'c0.488,0.489,0.733,1.114,0.733,1.874V36.5c0,0.761-0.244,1.386-0.733,1.874c-0.489,0.488-1.113,0.733-1.874,0.733' +
  'h-5.214c-0.761,0-1.386-0.244-1.874-0.733c-0.488-0.489-0.733-1.113-0.733-1.874V13.036z M165.357,135.572H50.643' +
  'V52.143h114.714V135.572z"/></svg>';


PaymentezForm.USER_SVG = '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
  'x="0px" y="4px" width="24px" height="16px" viewBox="0 0 216 146" enable-background="new 0 0 216 146" xml:space="preserve">' +
  '<g><path class="svg" d="M107.999,73c8.638,0,16.011-3.056,22.12-9.166c6.111-6.11,9.166-13.483,9.166-22.12c0-' +
  '8.636-3.055-16.009-9.166-22.12c-6.11-6.11-13.484-9.165-22.12-9.165c-8.636,0-16.01,3.055-22.12,9.165c-6.111,' +
  '6.111-9.166,13.484-9.166,22.12c0,8.637,3.055,16.01,9.166,22.12C91.99,69.944,99.363,73,107.999,73z"/>' +
  '<path class="svg" d="M165.07,106.037c-0.191-2.743-0.571-5.703-1.141-8.881c-0.57-3.178-1.291-6.124-2.16-8.84' +
  'c-0.869-2.715-2.037-5.363-3.504-7.943c-1.466-2.58-3.15-4.78-5.052-6.6s-4.223-3.272-6.965-4.358c-2.744-1.086' +
  '-5.772-1.63-9.085-1.63c-0.489,0-1.63,0.584-3.422,1.752s-3.815,2.472-6.069,3.911c-2.254,1.438-5.188,2.743-8.' +
  '799,3.909c-3.612,1.168-7.237,1.752-10.877,1.752c-3.639,0-7.264-0.584-10.876-1.752c-3.611-1.166-6.545-2.471-' +
  '8.799-3.909c-2.254-1.439-4.277-2.743-6.069-3.911c-1.793-1.168-2.933-1.752-3.422-1.752c-3.313,0-6.341,0.544-' +
  '9.084,1.63s-5.065,2.539-6.966,4.358c-1.901,1.82-3.585,4.02-5.051,6.6s-2.634,5.229-3.503,7.943c-0.869,2.716-' +
  '1.589,5.662-2.159,8.84c-0.571,3.178-0.951,6.137-1.141,8.881c-0.19,2.744-0.285,5.554-0.285,8.433c0,6.517,1.9' +
  '83,11.664,5.948,15.439c3.965,3.774,9.234,5.661,15.806,5.661h71.208c6.572,0,11.84-1.887,15.806-5.661c3.966-3' +
  '.775,5.948-8.921,5.948-15.439C165.357,111.591,165.262,108.78,165.07,106.037z"/></g></svg>';


PaymentezForm.MAIL_SVG = '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"' +
  'x="0px" y="4px" width="24px" height="16px" viewBox="0 0 216 146" enable-background="new 0 0 216 146" xml:space="preserve">' +
  '<path class="svg" d="M177.171,19.472c-2.553-2.553-5.622-3.829-9.206-3.829H48.036c-3.585,0-6.654,1.276-9.207,3.829C36.276,' +
  '22.025,35,25.094,35,28.679v88.644c0,3.585,1.276,6.652,3.829,9.205c2.553,2.555,5.622,3.83,9.207,3.83h119.929c3' +
  '.584,0,6.653-1.275,9.206-3.83c2.554-2.553,3.829-5.621,3.829-9.205V28.679C181,25.094,179.725,22.025,177.171,19' +
  '.472zM170.57,117.321c0,0.706-0.258,1.317-0.774,1.833s-1.127,0.773-1.832,0.773H48.035c-0.706,0-1.317-0.257-1.8' +
  '33-0.773c-0.516-0.516-0.774-1.127-0.774-1.833V54.75c1.738,1.955,3.612,3.748,5.622,5.377c14.557,11.189,26.126,' +
  '20.368,34.708,27.538c2.77,2.336,5.024,4.155,6.762,5.459s4.087,2.62,7.047,3.951s5.744,1.995,8.351,1.995H108h0.' +
  '081c2.606,0,5.392-0.664,8.351-1.995c2.961-1.331,5.311-2.647,7.049-3.951c1.737-1.304,3.992-3.123,6.762-5.459c8' +
  '.582-7.17,20.15-16.349,34.707-27.538c2.01-1.629,3.885-3.422,5.621-5.377V117.321z M170.57,30.797v0.896c0,3.204' +
  '-1.262,6.776-3.787,10.713c-2.525,3.938-5.256,7.075-8.188,9.41c-10.484,8.257-21.373,16.865-32.672,25.827c-0.32' +
  '6,0.271-1.277,1.073-2.852,2.403c-1.574,1.331-2.824,2.351-3.748,3.056c-0.924,0.707-2.131,1.562-3.625,2.566s-2.' +
  '865,1.752-4.114,2.24s-2.417,0.732-3.503,0.732H108h-0.082c-1.086,0-2.253-0.244-3.503-0.732c-1.249-0.488-2.621-' +
  '1.236-4.114-2.24c-1.493-1.004-2.702-1.859-3.625-2.566c-0.923-0.705-2.173-1.725-3.748-3.056c-1.575-1.33-2.526-' +
  '2.132-2.852-2.403c-11.297-8.962-22.187-17.57-32.67-25.827c-7.985-6.3-11.977-14.013-11.977-23.138c0-0.706,0.25' +
  '8-1.317,0.774-1.833c0.516-0.516,1.127-0.774,1.833-0.774h119.929c0.434,0.244,0.814,0.312,1.141,0.204c0.326-0.1' +
  '1,0.57,0.094,0.732,0.61c0.163,0.516,0.312,0.76,0.448,0.733c0.136-0.027,0.218,0.312,0.245,1.019c0.025,0.706,0.' +
  '039,1.061,0.039,1.061V30.797z"/></svg>';


PaymentezForm.INFORMATION_SVG = '<svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ' +
  'x="0px" y="4px" width="24px" height="16px" viewBox="0 0 216 146" enable-background="new 0 0 216 146" xml:space="preserve">' +
  '<g><path class="svg" d="M97.571,41.714h20.859c1.411,0,2.633-0.516,3.666-1.548c1.031-1.031,1.547-2.254,1.547-' +
  '3.666V20.857c0-1.412-0.516-2.634-1.549-3.667c-1.031-1.031-2.254-1.548-3.666-1.548H97.571c-1.412,0-2.634,0.51' +
  '7-3.666,1.548c-1.032,1.032-1.548,2.255-1.548,3.667V36.5c0,1.412,0.516,2.635,1.548,3.666C94.937,41.198,96.159' +
  ',41.714,97.571,41.714z"/><path class="svg" d="M132.523,111.048c-1.031-1.032-2.254-1.548-3.666-1.548h-5.215V6' +
  '2.571c0-1.412-0.516-2.634-1.547-3.666c-1.033-1.032-2.255-1.548-3.666-1.548H87.143c-1.412,0-2.634,0.516-3.666' +
  ',1.548c-1.032,1.032-1.548,2.254-1.548,3.666V73c0,1.412,0.516,2.635,1.548,3.666c1.032,1.032,2.254,1.548,3.666' +
  ',1.548h5.215V109.5h-5.215c-1.412,0-2.634,0.516-3.666,1.548c-1.032,1.032-1.548,2.254-1.548,3.666v10.429c0,1.4' +
  '12,0.516,2.635,1.548,3.668c1.032,1.03,2.254,1.547,3.666,1.547h41.714c1.412,0,2.634-0.517,3.666-1.547c1.031-1' +
  '.033,1.547-2.256,1.547-3.668v-10.429C134.07,113.302,133.557,112.08,132.523,111.048z"/></g></svg>';


/**
 * Get the key code from the given event.
 *
 * @param e
 * @returns {which|*|Object|which|which|string}
 */
PaymentezForm.keyCodeFromEvent = function(e) {
  return e.which || e.keyCode;
};


/**
 * Get whether a command key (ctrl of mac cmd) is held down.
 *
 * @param e
 * @returns {boolean|metaKey|*|metaKey}
 */
PaymentezForm.keyIsCommandFromEvent = function(e) {
  return e.ctrlKey || e.metaKey;
};


/**
 * Is the event a number key.
 *
 * @param e
 * @returns {boolean}
 */
PaymentezForm.keyIsNumber = function(e) {
  return PaymentezForm.keyIsTopNumber(e) || PaymentezForm.keyIsKeypadNumber(e);
};


/**
 * Is the event a top keyboard number key.
 *
 * @param e
 * @returns {boolean}
 */
PaymentezForm.keyIsTopNumber = function(e) {
  var keyCode = PaymentezForm.keyCodeFromEvent(e);
  return keyCode >= PaymentezForm.KEYS["0"] && keyCode <= PaymentezForm.KEYS["9"];
};


/**
 * Is the event a keypad number key.
 *
 * @param e
 * @returns {boolean}
 */
PaymentezForm.keyIsKeypadNumber = function(e) {
  var keyCode = PaymentezForm.keyCodeFromEvent(e);
  return keyCode >= PaymentezForm.KEYS["NUMPAD_0"] && keyCode <= PaymentezForm.KEYS["NUMPAD_9"];
};


/**
 * Is the event a delete key.
 *
 * @param e
 * @returns {boolean}
 */
PaymentezForm.keyIsDelete = function(e) {
  return PaymentezForm.keyCodeFromEvent(e) == PaymentezForm.KEYS["DELETE"];
};


/**
 * Is the event a backspace key.
 *
 * @param e
 * @returns {boolean}
 */
PaymentezForm.keyIsBackspace = function(e) {
  return PaymentezForm.keyCodeFromEvent(e) == PaymentezForm.KEYS["BACKSPACE"];
};


/**
 * Is the event a deletion key (delete or backspace)
 *
 * @param e
 * @returns {boolean}
 */
PaymentezForm.keyIsDeletion = function(e) {
  return PaymentezForm.keyIsDelete(e) || PaymentezForm.keyIsBackspace(e);
};


/**
 * Is the event an arrow key.
 *
 * @param e
 * @returns {boolean}
 */
PaymentezForm.keyIsArrow = function(e) {
  var keyCode = PaymentezForm.keyCodeFromEvent(e);
  return keyCode >= PaymentezForm.KEYS["ARROW_LEFT"] && keyCode <= PaymentezForm.KEYS["ARROW_DOWN"];
};


/**
 * Is the event a navigation key.
 *
 * @param e
 * @returns {boolean}
 */
PaymentezForm.keyIsNavigation = function(e) {
  var keyCode = PaymentezForm.keyCodeFromEvent(e);
  return keyCode == PaymentezForm.KEYS["HOME"] || keyCode == PaymentezForm.KEYS["END"];
};


/**
 * Is the event a keyboard command (copy, paste, cut, highlight all)
 *
 * @param e
 * @returns {boolean|metaKey|*|metaKey|boolean}
 */
PaymentezForm.keyIsKeyboardCommand = function(e) {
  var keyCode = PaymentezForm.keyCodeFromEvent(e);
  return PaymentezForm.keyIsCommandFromEvent(e) &&
    (
      keyCode == PaymentezForm.KEYS["A"] ||
      keyCode == PaymentezForm.KEYS["X"] ||
      keyCode == PaymentezForm.KEYS["C"] ||
      keyCode == PaymentezForm.KEYS["V"]
    );
};


/**
 * Is the event the tab key?
 *
 * @param e
 * @returns {boolean}
 */
PaymentezForm.keyIsTab = function(e) {
  return PaymentezForm.keyCodeFromEvent(e) == PaymentezForm.KEYS["TAB"];
};


/**
 * Copy all attributes of the source element to the destination element.
 *
 * @param source
 * @param destination
 */
PaymentezForm.copyAllElementAttributes = function(source, destination) {
  $.each(source[0].attributes, function(idx, attr) {
    destination.attr(attr.nodeName, attr.nodeValue);
  });
};


/**
 * Strip all characters that are not in the range 0-9
 *
 * @param string
 * @returns {string}
 */
PaymentezForm.numbersOnlyString = function(string) {
  var numbersOnlyString = "";
  for(var i = 0; i < string.length; i++) {
    var currentChar = string.charAt(i);
    var isValid = !isNaN(parseInt(currentChar));
    if(isValid) { numbersOnlyString += currentChar; }
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
PaymentezForm.applyFormatMask = function(string, mask) {
  var formattedString = "";
  var numberPos = 0;
  for(var j = 0; j < mask.length; j++) {
    var currentMaskChar = mask[j];
    if(currentMaskChar == "X") {
      var digit = string.charAt(numberPos);
      if(!digit) {
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
 * Establish the type of a card from the number.
 *
 * @param number
 * @returns {string}
 */
PaymentezForm.cardTypeFromNumber = function(number) {
  var number = number.replace(" ","");

  // Credisensa
  var re = new RegExp("^(000029|960018)");
  if (number.match(re) != null)
    return "Credisensa";

  // Diners - Carte Blanche
  re = new RegExp("^30[0-5]");
  if (number.match(re) != null)
    return "Diners - Carte Blanche";

  // Diners
  re = new RegExp("^(30[6-9]|36|38)");
  if (number.match(re) != null)
    return "Diners";

  // JCB
  re = new RegExp("^35(2[89]|[3-8][0-9])");
  if (number.match(re) != null)
    return "JCB";

  // AMEX
  re = new RegExp("^3[47]");
  if (number.match(re) != null)
    return "AMEX";

  // Visa Electron
  re = new RegExp("^(4026|417500|4508|4844|491(3|7))");
  if (number.match(re) != null)
    return "Visa Electron";

  // Visa
  re = new RegExp("^4");
  if (number.match(re) != null)
    return "Visa";

  // Mastercard
  re = new RegExp("^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[01]|2720)");
  if (number.match(re) != null)
    return "Mastercard";

  // Exito
  re = ["590309", "570423", "590312"];
  if (re.indexOf(number.substring(0, 6)) != -1)
    return "Exito";

  // Discover
  re = new RegExp("^(6011|622(12[6-9]|1[3-9][0-9]|[2-8][0-9]{2}|9[0-1][0-9]|92[0-5]|64[4-9])|65)");
  if (number.match(re) != null)
    return "Discover";

  return "";
};


/**
 * Get the caret start position of the given element.
 *
 * @param element
 * @returns {*}
 */
PaymentezForm.caretStartPosition = function(element) {
  if(typeof element.selectionStart == "number") {
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
PaymentezForm.caretEndPosition = function(element) {
  if(typeof element.selectionEnd == "number") {
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
PaymentezForm.setCaretPosition = function(element, caretPos) {
  if(element != null) {
    if(element.createTextRange) {
      var range = element.createTextRange();
      range.move('character', caretPos);
      range.select();
    } else {
      if(element.selectionStart) {
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
PaymentezForm.normaliseCaretPosition = function(mask, caretPosition) {
  var numberPos = 0;
  if(caretPosition < 0 || caretPosition > mask.length) { return 0; }
  for(var i = 0; i < mask.length; i++) {
    if(i == caretPosition) { return numberPos; }
    if(mask[i] == "X") { numberPos++; }
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
PaymentezForm.denormaliseCaretPosition = function(mask, caretPosition) {
  var numberPos = 0;
  if(caretPosition < 0 || caretPosition > mask.length) { return 0; }
  for(var i = 0; i < mask.length; i++) {
    if(numberPos == caretPosition) { return i; }
    if(mask[i] == "X") { numberPos++; }
  }
  return mask.length;
};


/**
 *
 *
 * @param e
 */
PaymentezForm.filterNumberOnlyKey = function(e) {
  var isNumber = PaymentezForm.keyIsNumber(e);
  var isDeletion = PaymentezForm.keyIsDeletion(e);
  var isArrow = PaymentezForm.keyIsArrow(e);
  var isNavigation = PaymentezForm.keyIsNavigation(e);
  var isKeyboardCommand = PaymentezForm.keyIsKeyboardCommand(e);
  var isTab = PaymentezForm.keyIsTab(e);

  if(!isNumber && !isDeletion && !isArrow && !isNavigation && !isKeyboardCommand && !isTab) {
    e.preventDefault();
  }
};


/**
 *
 *
 * @param keyCode
 * @returns {*}
 */
PaymentezForm.digitFromKeyCode = function(keyCode) {

  if(keyCode >= PaymentezForm.KEYS["0"] && keyCode <= PaymentezForm.KEYS["9"]) {
    return keyCode - PaymentezForm.KEYS["0"];
  }

  if(keyCode >= PaymentezForm.KEYS["NUMPAD_0"] && keyCode <= PaymentezForm.KEYS["NUMPAD_9"]) {
    return keyCode - PaymentezForm.KEYS["NUMPAD_0"];
  }

  return null;
};


/**
 *
 *
 * @param e
 * @param mask
 */
PaymentezForm.handleMaskedNumberInputKey = function(e, mask) {
  PaymentezForm.filterNumberOnlyKey(e);

  var keyCode = e.which || e.keyCode;

  var element = e.target;

  var caretStart = PaymentezForm.caretStartPosition(element);
  var caretEnd = PaymentezForm.caretEndPosition(element);


  // Calculate normalised caret position
  var normalisedStartCaretPosition = PaymentezForm.normaliseCaretPosition(mask, caretStart);
  var normalisedEndCaretPosition = PaymentezForm.normaliseCaretPosition(mask, caretEnd);


  var newCaretPosition = caretStart;

  var isNumber = PaymentezForm.keyIsNumber(e);
  var isDelete = PaymentezForm.keyIsDelete(e);
  var isBackspace = PaymentezForm.keyIsBackspace(e);

  if (isNumber || isDelete || isBackspace) {
    e.preventDefault();
    var rawText = $(element).val();
    var numbersOnly = PaymentezForm.numbersOnlyString(rawText);

    var digit = PaymentezForm.digitFromKeyCode(keyCode);

    var rangeHighlighted = normalisedEndCaretPosition > normalisedStartCaretPosition;

    // Remove values highlighted (if highlighted)
    if (rangeHighlighted) {
      numbersOnly = (numbersOnly.slice(0, normalisedStartCaretPosition) + numbersOnly.slice(normalisedEndCaretPosition));
    }

    // Forward Action
    if (caretStart != mask.length) {

      // Insert number digit
      if (isNumber && rawText.length <= mask.length) {
        numbersOnly = (numbersOnly.slice(0, normalisedStartCaretPosition) + digit + numbersOnly.slice(normalisedStartCaretPosition));
        newCaretPosition = Math.max(
          PaymentezForm.denormaliseCaretPosition(mask, normalisedStartCaretPosition + 1),
          PaymentezForm.denormaliseCaretPosition(mask, normalisedStartCaretPosition + 2) - 1
        );
      }

      // Delete
      if (isDelete) {
        numbersOnly = (numbersOnly.slice(0, normalisedStartCaretPosition) + numbersOnly.slice(normalisedStartCaretPosition + 1));
      }

    }

    // Backward Action
    if (caretStart != 0) {

      // Backspace
      if(isBackspace && !rangeHighlighted) {
        numbersOnly = (numbersOnly.slice(0, normalisedStartCaretPosition - 1) + numbersOnly.slice(normalisedStartCaretPosition));
        newCaretPosition = PaymentezForm.denormaliseCaretPosition(mask, normalisedStartCaretPosition - 1);
      }
    }


    $(element).val(PaymentezForm.applyFormatMask(numbersOnly, mask));

    PaymentezForm.setCaretPosition(element, newCaretPosition);
  }
};


/**
 *
 *
 * @param e
 * @param cardMask
 */
PaymentezForm.handleCreditCardNumberKey = function(e, cardMask) {
  PaymentezForm.handleMaskedNumberInputKey(e, cardMask);
};


PaymentezForm.handleCreditCardNumberChange = function(e) {

};


PaymentezForm.handleExpiryKey = function(e) {
  PaymentezForm.handleMaskedNumberInputKey(e, PaymentezForm.EXPIRY_MASK);
};


/**
 * Dispatch beacon ~ for future feature.
 */
//PaymentezForm.dispatchBeacon = function() {
//  $.ajax({
//    type: "POST",
//    url: "https://PaymentezForm.co.uk/beacon",
//    data: {
//      uri: window.location.href
//    },
//    crossDomain : true,
//    dataType: 'json'
//  });
//};

//window.onload = function() {
  //PaymentezForm.dispatchBeacon();
//};


/**
 * Get the card number inputted.
 *
 * @returns {string}
 */
PaymentezForm.prototype.getCardNumber = function() {
  return this.cardNumberInput.val();
};

/**
 * Is the given data a valid card?
 *
 * @returns {boolean}
 */
PaymentezForm.prototype.isValidData = function() {
  var is_date_valid = this.refreshExpiryMonthValidation();
  var is_cvc_valid = this.refreshCvcValidation();
  var is_card_holder_valid = this.refreshCardHolderNameValidation();
  var is_email_valid = this.refreshEmailValidation();
  var is_cellphone_valid = this.refreshCellPhoneValidation();
  var is_card_number_valid = this.refreshCardNumberValidation();  
  var is_fiscal_number_valid = this.refreshFiscalNumberValidation();
  var valid = is_date_valid && is_cvc_valid && is_card_holder_valid && is_card_number_valid && is_email_valid && is_cellphone_valid && is_fiscal_number_valid;
  return valid;
};

PaymentezForm.prototype.refreshCvcValidation = function() {
  if(this.isCvcValid()){
    this.cvcInput.parent().removeClass("has-error");
    return true;
  }else{
    this.cvcInput.parent().addClass("has-error");
    return false;
  }
};

PaymentezForm.prototype.refreshCardHolderNameValidation = function() {
  if(this.isCardHolderNameValid()){
    this.nameInput.parent().removeClass("has-error");
    return true;
  }else{
    this.nameInput.parent().addClass("has-error");
    return false;
  }
};

PaymentezForm.prototype.refreshEmailValidation = function() {
  if(this.isEmailValid()){
    this.emailInput.parent().removeClass("has-error");
    return true;
  }else{
    this.emailInput.parent().addClass("has-error");
    return false;
  }
};

PaymentezForm.prototype.refreshCellPhoneValidation = function() {
  if(this.isCellPhoneValid()){
    this.cellPhoneInput.parent().removeClass("has-error");
    return true;
  }else{
    this.cellPhoneInput.parent().addClass("has-error");
    return false;
  }
};

PaymentezForm.prototype.refreshCardNumberValidation = function() {
  if(this.isCardNumberValid()){
    this.cardNumberInput.parent().removeClass("has-error");
    return true;
  }else{
    this.cardNumberInput.parent().addClass("has-error");
    return false;
  }
};

PaymentezForm.prototype.refreshFiscalNumberValidation = function() {
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

PaymentezForm.prototype.refreshValidationOption = function() {
  if (this.getValidationOption() == "otp"){
    this.removeCvcContainer();
  } else {
    this.addCvcContainer();
  }
};

/**
 * Is the given input a valid cvc?
 *
 * @returns {boolean}
 */
PaymentezForm.prototype.isCvcValid = function() {
  if (this.getValidationOption() == "cvc") {
    return this.getCvc() != null && this.getCvc().trim().length == this.cvcLenght;
  } else {
    return true;
  }
}

/**
 * Is the given input a valid CardHolderName?
 *
 * @returns {boolean}
 */
PaymentezForm.prototype.isCardHolderNameValid = function() {
  if(this.captureName)
    return this.getName() != null && this.getName().length >= 5;
  else
    return true;
}

PaymentezForm.prototype.isEmailValid = function() {
  if(this.captureEmail){
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return this.getEmail() != null && this.getEmail().length >= 5 && re.test(this.getEmail());
  }else
    return true;
}

PaymentezForm.prototype.isCellPhoneValid = function() {
  if(this.captureCellPhone)
    return this.getCellPhone() != null && this.getCellPhone().length >= 5;
  else
    return true;
}

/**
 * Is the given input a valid Card Number?
 *
 * @returns {boolean}
 */
PaymentezForm.prototype.isCardNumberValid = function() {
  var value = this.getCardNumber();
  if(value == '') return false;
  if (/[^0-9-\s]+/.test(value)) return false;
  
  // The Luhn Algorithm. It's so pretty.
  var nCheck = 0, nDigit = 0, bEven = false;
  value = value.replace(/\D/g, "");

  for (var n = value.length - 1; n >= 0; n--) {
    var cDigit = value.charAt(n),
        nDigit = parseInt(cDigit, 10);

    if (bEven) {
      if ((nDigit *= 2) > 9) nDigit -= 9;
    }

    nCheck += nDigit;
    bEven = !bEven;
  }

  return (nCheck % 10) == 0;
}

/**
 * Validate if exists the fiscal number in the form
 *
 * @returns {boolean}
 */
PaymentezForm.prototype.fiscalNumberAdded = function() {
  var fNumber = this.elem.find(".fiscal-number-wrapper");
  return fNumber.length >= 1;
}

/**
 * Is the given input a valid FiscalNumber?
 *
 * @returns {boolean}
 */
PaymentezForm.prototype.isFiscalNumberValid = function() {
  if(this.fiscalNumberAdded())
    return this.getFiscalNumber() != null && this.getFiscalNumber().length >= 8;
  else
    return true
}

/**
 * Validate if exists the expiry date in the form
 *
 * @returns {boolean}
 */
PaymentezForm.prototype.expiryContainerAdded = function() {
  var exContainter = this.elem.find(".expiry-container");
  return exContainter.length >= 1;
}

/**
 * Validate if the validation mode is active
 *
 * @returns {boolean}
 */
PaymentezForm.prototype.validationModeOption = function() {
  var valOption = this.elem.find(".validation-container");
  return valOption.length >= 1;
}

/**
 * Validate if the cvc is displayed
 *
 * @returns {boolean}
 */
PaymentezForm.prototype.cvcContainerAdded = function() {
  var cvcContainer = this.elem.find(".cvc-container");
  return cvcContainer.length >= 1;
}

/**
 * Get the card object.
 *
 * @returns {object}
 */
PaymentezForm.prototype.getCard = function() {
  var data = null;
  if(this.isValidData()){
    var today = new Date();
    var currentMonth = (today.getMonth() + 1);
    var currentYear = "" + today.getFullYear();
    var year = this.getExpiryYear();
  
    if (("" + year).length == 2) {
      year = currentYear.substring(0, 2) + "" + this.getExpiryYear();
    }

    data = {  
      "card": {    
        "number": this.getCardNumber().split(' ').join(''),
        "holder_name": this.getName(),
        "expiry_year": Number(year),
        "expiry_month": Number(this.getExpiryMonth()),
        "type": this.cardType,
        "cvc": this.getCvc()
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
PaymentezForm.prototype.getCardType = function() {
  return PaymentezForm.cardTypeFromNumber(this.getCardNumber());
};


/**
 * Get the name inputted.
 *
 * @returns {string}
 */
PaymentezForm.prototype.getName = function() {
  return this.nameInput.val();
};

/**
 * Get the email inputted.
 *
 * @returns {string}
 */
PaymentezForm.prototype.getEmail = function() {
  return this.emailInput.val();
};

/**
 * Get the cellphone inputted.
 *
 * @returns {string}
 */
PaymentezForm.prototype.getCellPhone = function() {
  return this.cellPhoneInput.val();
};

/**
 * Get the expiry month inputted.
 *
 * @returns {string}
 */
PaymentezForm.prototype.getExpiryMonth = function() {
  return this.expiryMonthInput.val();
};

/**
 * Get the expiry year inputted.
 *
 * @returns {string}
 */
PaymentezForm.prototype.getExpiryYear = function() {
  return this.expiryYearInput.val();
};

/**
 * Get the fiscal number inputted.
 *
 * @returns {number}
 */
PaymentezForm.prototype.getFiscalNumber = function() {
  if (this.fiscalNumberAdded()){
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
PaymentezForm.prototype.getValidationOption = function() {
  if (this.validationModeOption()) {
    return this.elem.find("input[type='radio']:checked").val();
  } else {
    return "cvc"
  }
};

/**
 * Get the CVC number inputted.
 *
 * @returns {number}
 */
PaymentezForm.prototype.getCvc = function() {
  if (this.getValidationOption() == "cvc") {
    return this.cvcInput.val();
  }else{
    return "";
  }
};

// --- --- --- --- --- --- --- --- --- --- ---

/**
 * Set the icon colour.
 *
 * @param colour
 */
PaymentezForm.prototype.setIconColour = function(colour) {
  this.elem.find(".icon .svg").css({"fill": colour});
};


/**
 *
 */
PaymentezForm.prototype.refreshCreditCardTypeIcon = function() {
  this.setCardTypeIconFromNumber(PaymentezForm.numbersOnlyString(this.cardNumberInput.val()));
};


/**
 *
 */
PaymentezForm.prototype.refreshCreditCardNumberFormat = function() {
  var numbersOnly = PaymentezForm.numbersOnlyString($(this.cardNumberInput).val());
  var formattedNumber = PaymentezForm.applyFormatMask(numbersOnly, this.creditCardNumberMask);
  $(this.cardNumberInput).val(formattedNumber);
};


/**
 *
 */
PaymentezForm.prototype.refreshExpiryMonthYearInput = function() {
  var numbersOnly = PaymentezForm.numbersOnlyString($(this.expiryMonthYearInput).val());
  var formattedNumber = PaymentezForm.applyFormatMask(numbersOnly, PaymentezForm.EXPIRY_MASK);
  $(this.expiryMonthYearInput).val(formattedNumber);
};


/**
 *
 */
PaymentezForm.prototype.refreshCvc = function() {
  var numbersOnly = PaymentezForm.numbersOnlyString($(this.cvcInput).val());
  var formattedNumber = PaymentezForm.applyFormatMask(numbersOnly, this.creditCardNumberMask);
  $(this.cvcInput).val(formattedNumber);
};


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---


/**
 * Update the display to set the card type from the current number.
 *
 * @param number
 */
PaymentezForm.prototype.setCardTypeIconFromNumber = function(number) {
  switch(PaymentezForm.cardTypeFromNumber(number)) {
    case "Visa Electron":
    case "Visa":
      this.setCardTypeAsVisa();
      break;
    case "Mastercard":
      this.setCardTypeAsMasterCard();
      break;
    case "Credisensa":
      this.setCardTypeAsCredisensa();
      break;
    case "AMEX":
      this.setCardTypeAsAmericanExpress();
      break;
    case "Discover":
      this.setCardTypeAsDiscover();
      break;
    case "Diners - Carte Blanche":
    case "Diners":
      this.setCardTypeAsDiners();
      break;
    case "JCB":
      this.setCardTypeAsJcb();
      break;
    case "Exito":
      this.setCardTypeAsExito();
      break;
    default:
      this.clearCardType();
  }
};


/**
 * Set the card number mask
 *
 * @param cardMask
 */
PaymentezForm.prototype.setCardMask = function(cardMask) {
  this.creditCardNumberMask = cardMask;
  this.cardNumberInput.attr("maxlength", cardMask.length);
};


/**
 * Set the CVC with a mask of 3 digits
 */
PaymentezForm.prototype.setCvc3 = function() {
  this.cvcLenght = 3;
  this.cvcInput.attr("maxlength", PaymentezForm.CVC_MASK_3.length);
};


/**
 * Set the CVC with a mask of 4 digits
 */
PaymentezForm.prototype.setCvc4 = function() {
  this.cvcLenght = 4;
  this.cvcInput.attr("maxlength", PaymentezForm.CVC_MASK_4.length);
};

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---


/**
 * Reset the card type icon - show nothing
 */
PaymentezForm.prototype.clearCardTypeIcon = function() {
  this.elem.find(".card-number-wrapper .card-type-icon").removeClass("show");
};


/**
 * Set the card type icon as - Visa
 */
PaymentezForm.prototype.setCardTypeIconAsVisa = function() {
  this.elem.find(".card-number-wrapper .card-type-icon").attr("class", "card-type-icon show visa");
};


/**
 * Set the card type icon as - Master Card
 */
PaymentezForm.prototype.setCardTypeIconAsMasterCard = function() {
  this.elem.find(".card-number-wrapper .card-type-icon").attr("class", "card-type-icon show master-card");
};


/**
 * Set the card type icon as - American Express (AMEX)
 */
PaymentezForm.prototype.setCardTypeIconAsAmericanExpress = function() {
  this.elem.find(".card-number-wrapper .card-type-icon").attr("class", "card-type-icon show american-express");
};

/**
 * Set the card type icon as - Credisensa
 */
PaymentezForm.prototype.setCardTypeIconAsCredisensa = function() {
  this.elem.find(".card-number-wrapper .card-type-icon").attr("class", "card-type-icon show credisensa");
};

/**
 * Set the card type icon as - Discover
 */
PaymentezForm.prototype.setCardTypeIconAsDiscover = function() {
  this.elem.find(".card-number-wrapper .card-type-icon").attr("class", "card-type-icon show discover");
};


/**
 * Set the card type icon as - Diners
 */
PaymentezForm.prototype.setCardTypeIconAsDiners = function() {
  this.elem.find(".card-number-wrapper .card-type-icon").attr("class", "card-type-icon show diners");
};


/**
 * Set the card type icon as - JCB
 */
PaymentezForm.prototype.setCardTypeIconAsJcb = function() {
  this.elem.find(".card-number-wrapper .card-type-icon").attr("class", "card-type-icon show jcb");
};


/**
 * Set the card type icon as - Exito
 */
PaymentezForm.prototype.setCardTypeIconAsExito = function() {
  this.elem.find(".card-number-wrapper .card-type-icon").attr("class", "card-type-icon show exito");
};


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---


/**
 * Reset the card type
 */
PaymentezForm.prototype.clearCardType = function() {
  this.clearCardTypeIcon();
  this.setCardMask(PaymentezForm.CREDIT_CARD_NUMBER_DEFAULT_MASK);
  this.setCvc3();
  this.removeExitoChanges();
};


/**
 * Set the card type as - Visa
 */
PaymentezForm.prototype.setCardTypeAsVisa = function() {
  this.cardType = 'vi';
  this.setCardTypeIconAsVisa();
  this.setCardMask(PaymentezForm.CREDIT_CARD_NUMBER_VISA_MASK);
  this.setCvc3();
  this.removeExitoChanges();
};


/**
 * Set the card type as - Master Card
 */
PaymentezForm.prototype.setCardTypeAsMasterCard = function() {
  this.cardType = 'mc';
  this.setCardTypeIconAsMasterCard();
  this.setCardMask(PaymentezForm.CREDIT_CARD_NUMBER_MASTERCARD_MASK);
  this.setCvc3();
  this.removeExitoChanges();
};


/**
 * Set the card type as - American Express (AMEX)
 */
PaymentezForm.prototype.setCardTypeAsAmericanExpress = function() {
  this.cardType = 'ax';
  this.setCardTypeIconAsAmericanExpress();
  this.setCardMask(PaymentezForm.CREDIT_CARD_NUMBER_AMEX_MASK);
  this.setCvc4();
  this.removeExitoChanges();
};

/**
 * Set the card type as - Credisensa
 */
PaymentezForm.prototype.setCardTypeAsCredisensa = function() {
  this.cardType = 'cs';
  this.setCardTypeIconAsCredisensa();
  this.setCardMask(PaymentezForm.CREDIT_CARD_NUMBER_MASTERCARD_MASK);
  this.setCvc3();
  this.removeExitoChanges();
};

/**
 * Set the card type as - Discover
 */
PaymentezForm.prototype.setCardTypeAsDiscover = function() {
  this.cardType = 'dc';
  this.setCardTypeIconAsDiscover();
  this.setCardMask(PaymentezForm.CREDIT_CARD_NUMBER_DISCOVER_MASK);
  this.setCvc3();
  this.removeExitoChanges();
};


/**
 * Set the card type as - Diners
 */
PaymentezForm.prototype.setCardTypeAsDiners = function() {
  this.cardType = 'di';
  this.setCardTypeIconAsDiners();
  this.setCardMask(PaymentezForm.CREDIT_CARD_NUMBER_DINERS_MASK);
  this.setCvc3();
  this.removeExitoChanges();
};


/**
 * Set the card type as - JCB
 */
PaymentezForm.prototype.setCardTypeAsJcb = function() {
  this.cardType = 'jc';
  this.setCardTypeIconAsJcb();
  this.setCardMask(PaymentezForm.CREDIT_CARD_NUMBER_JCB_MASK);
  this.setCvc3();
  this.removeExitoChanges();
};


/**
 * Set the card type as - Exito
 */
PaymentezForm.prototype.setCardTypeAsExito = function() {
  this.cardType = 'ex';
  this.setCardTypeIconAsExito();
  this.setCardMask(PaymentezForm.CREDIT_CARD_NUMBER_EXITO_MASK);
  this.setCvc4();
  this.addExitoChanges();
};


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
/**
 * Change the method of validation
 */
PaymentezForm.prototype.addValidationOptions = function() {
  if (!this.validationModeOption()) {
    this.initValidationCvc();
    this.initValidationOtp();
    this.setupValidationOptionSet();
    this.setIconColour(this.iconColour);
  }
};

PaymentezForm.prototype.addFiscalNumber = function() {
  if (!this.fiscalNumberAdded()) {
    this.initFiscalNumberInput();
    this.setupFiscalNumberInput();
    this.setIconColour(this.iconColour);
  }
};

PaymentezForm.prototype.removeFiscalNumber = function() {
  if (this.fiscalNumberAdded()) {
    this.elem.find(".fiscal-number-wrapper").remove();
  }
};

PaymentezForm.prototype.removeValidationOptions = function() {
  if (this.validationModeOption()) {
    this.elem.find(".validation-container").remove();
  }
};

PaymentezForm.prototype.removeExpiryContainer = function() {
  if (this.expiryContainerAdded()) {
    this.elem.find(".expiry-container").remove();
    this.elem.find(".cvc-container").addClass("center-cvc");
  }
};

PaymentezForm.prototype.addExpiryContainer = function() {
  if (!this.expiryContainerAdded()) {
    this.elem.find(".cvc-container").removeClass("center-cvc")
    this.initExpiryMonthInput();
    this.initExpiryYearInput();
    this.setupExpiryInput();
    this.setIconColour(this.iconColour);
  }
};

PaymentezForm.prototype.removeCvcContainer = function() {
  if(this.cvcContainerAdded()) {
    this.elem.find(".cvc-container").remove();
  }
}

PaymentezForm.prototype.addCvcContainer = function() {
  if(!this.cvcContainerAdded()) {
    this.initCvcInput();
    this.setupCvcInput();
    this.setIconColour(this.iconColour);
    if (!this.expiryContainerAdded()) {
      this.elem.find(".cvc-container").addClass("center-cvc")
    }
    if(this.getCardType() == "Exito") {
      this.setCvc4();
    }
  }
}
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
/**
 * The next methods are temporary because only exito use the methods of validation
 */
PaymentezForm.prototype.addExitoChanges = function() {
  this.addFiscalNumber();
  this.addValidationOptions();
  this.removeExpiryContainer();
}

PaymentezForm.prototype.removeExitoChanges = function() {
  this.addExpiryContainer();
  this.addCvcContainer();
  this.removeFiscalNumber();
  this.removeValidationOptions();
}
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---


/**
 * Initialise the card number input
 */
PaymentezForm.prototype.initCardNumberInput = function() {

  // Find or create the card number input element
  this.cardNumberInput = PaymentezForm.detachOrCreateElement(this.elem, ".card-number", "<input class='card-number' />");

  // Ensure the card number element has a name
  if (!PaymentezForm.elementHasAttribute(this.cardNumberInput, "name")) {
    this.cardNumberInput.attr("name", "card-number");
  }

  // Ensure the card number has a placeholder
  if (!PaymentezForm.elementHasAttribute(this.cardNumberInput, "placeholder")) {
    this.cardNumberInput.attr("placeholder", PaymentezForm.CREDIT_CARD_NUMBER_PLACEHOLDER);
  }

  this.cardNumberInput.attr("type", "tel");
  this.cardNumberInput.attr("maxlength", this.creditCardNumberMask.length);
  this.cardNumberInput.attr("x-autocompletetype", "cc-number");
  this.cardNumberInput.attr("autocompletetype", "cc-number");
  this.cardNumberInput.attr("autocorrect", "off");
  this.cardNumberInput.attr("spellcheck", "off");
  this.cardNumberInput.attr("autocapitalize", "off");

  // ---

  //
  // Events
  //
  var $this = this;
  this.cardNumberInput.keydown(function(e) {
    PaymentezForm.handleCreditCardNumberKey(e, $this.creditCardNumberMask);
  });
  this.cardNumberInput.keyup(function() {
    $this.refreshCreditCardTypeIcon();
  });
  //this.cardNumberInput.change(PaymentezForm.handleCreditCardNumberChange);
  this.cardNumberInput.on('paste', function() {
    setTimeout(function() {
      $this.refreshCreditCardNumberFormat();
      $this.refreshCreditCardTypeIcon();
    }, 1);
  });
};


/**
 * Initialise the name input
 */
PaymentezForm.prototype.initNameInput = function() {

  // Enable name input if a field has been created
  if(!this.captureName)
    this.captureName = this.elem.find(".name")[0] != null;

  // Find or create the name input element
  this.nameInput = PaymentezForm.detachOrCreateElement(this.elem, ".name", "<input class='name' />");

  // Ensure the name element has a field name
  if (!PaymentezForm.elementHasAttribute(this.nameInput, "name")) {
    this.nameInput.attr("name", "card-holder");
  }

  // Ensure the name element has a placeholder
  if (!PaymentezForm.elementHasAttribute(this.nameInput, "placeholder")) {
    this.nameInput.attr("placeholder", PaymentezForm.NAME_PLACEHOLDER);
  }
};

/**
 * Initialise the email input
 */
PaymentezForm.prototype.initEmailInput = function() {
  
    // Enable email input if a field has been created
    if(!this.captureEmail)
      this.captureEmail = this.elem.find(".email")[0] != null;
  
    // Find or create the email input element
    this.emailInput = PaymentezForm.detachOrCreateElement(this.elem, ".email", "<input class='email' />");
  
    // Ensure the email element has a field email
    if (!PaymentezForm.elementHasAttribute(this.emailInput, "name")) {
      this.emailInput.attr("name", "email");
    }
  
    // Ensure the email element has a placeholder
    if (!PaymentezForm.elementHasAttribute(this.emailInput, "placeholder")) {
      this.emailInput.attr("placeholder", PaymentezForm.EMAIL_PLACEHOLDER);
    }

    this.emailInput.attr("type", "email");
    this.emailInput.attr("autocorrect", "off");
    this.emailInput.attr("spellcheck", "off");
    this.emailInput.attr("autocapitalize", "off");
  };

  /**
 * Initialise the cellphone input
 */
PaymentezForm.prototype.initCellPhoneInput = function() {
  
    // Enable cellphone input if a field has been created
    if(!this.captureCellPhone)
      this.captureCellPhone = this.elem.find(".cellphone")[0] != null;
  
    // Find or create the cellphone input element
    this.cellPhoneInput = PaymentezForm.detachOrCreateElement(this.elem, ".cellphone", "<input class='cellphone' />");
  
    // Ensure the cellphone element has a field cellphone
    if (!PaymentezForm.elementHasAttribute(this.cellPhoneInput, "name")) {
      this.cellPhoneInput.attr("name", "cellphone");
    }
  
    // Ensure the cellphone element has a placeholder
    if (!PaymentezForm.elementHasAttribute(this.cellPhoneInput, "placeholder")) {
      this.cellPhoneInput.attr("placeholder", PaymentezForm.CELLPHONE_PLACEHOLDER);
    }

    this.cellPhoneInput.attr("type", "tel");
    this.cellPhoneInput.attr("autocorrect", "off");
    this.cellPhoneInput.attr("spellcheck", "off");
    this.cellPhoneInput.attr("autocapitalize", "off");
  };


/**
 * Initialise the expiry month input
 */
PaymentezForm.prototype.initExpiryMonthInput = function() {
  this.expiryMonthInput = PaymentezForm.detachOrCreateElement(this.elem, ".expiry-month", "<input class='expiry-month' />");
};


/**
 * Initialise the expiry year input
 */
PaymentezForm.prototype.initExpiryYearInput = function() {
  this.expiryYearInput = PaymentezForm.detachOrCreateElement(this.elem, ".expiry-year", "<input class='expiry-year' />");
};


/**
 * Initialise the card CVC input
 */
PaymentezForm.prototype.initCvcInput = function() {

  // Find or create the CVC input element
  this.cvcInput = PaymentezForm.detachOrCreateElement(this.elem, ".cvc", "<input class='cvc' />");

  // Ensure the CVC has a placeholder
  if (!PaymentezForm.elementHasAttribute(this.cvcInput, "placeholder")) {
    this.cvcInput.attr("placeholder", PaymentezForm.CVC_PLACEHOLDER);
  }

  this.cvcInput.attr("type", "tel");
  this.cvcInput.attr("maxlength", PaymentezForm.CVC_MASK_3.length);
  this.cvcInput.attr("x-autocompletetype", "cc-csc");
  this.cvcInput.attr("autocompletetype", "cc-csc");
  this.cvcInput.attr("autocorrect", "off");
  this.cvcInput.attr("spellcheck", "off");
  this.cvcInput.attr("autocapitalize", "off");


  //
  // Events
  //
  var $this = this;
  this.cvcInput.keydown(PaymentezForm.filterNumberOnlyKey);
  this.cvcInput.on('paste', function() {
    setTimeout(function() {
      $this.refreshCvc();
    }, 1);
  });
};

/**
 * Initialise the fiscal number input
 */
PaymentezForm.prototype.initFiscalNumberInput = function() {

  // Find or create the fiscal number input element
  this.fiscalNumberInput = PaymentezForm.detachOrCreateElement(this.elem, ".fiscal-number", "<input class='fiscal-number' />");

  // Ensure the fiscal number element has a field name
  if (!PaymentezForm.elementHasAttribute(this.fiscalNumberInput, "name")) {
    this.fiscalNumberInput.attr("name", "fiscal-number");
  }

  // Ensure the fiscal number element has a placeholder
  if (!PaymentezForm.elementHasAttribute(this.fiscalNumberInput, "placeholder")) {
    this.fiscalNumberInput.attr("placeholder", PaymentezForm.FISCAL_NUMBER_PLACEHOLDER);
  }
};

/**
 * Initialise the validation option by Cvc
 */
PaymentezForm.prototype.initValidationCvc = function() {
  var wrapper = PaymentezForm.detachOrCreateElement(this.elem, ".validation-wrapper-cvc", "<div class='validation-wrapper-cvc'></div>");
  var label = PaymentezForm.detachOrCreateElement(this.elem, ".validation-label", "<label>CVC</label>");
  label.attr("class", "validation-label");
  var optionCvc = PaymentezForm.detachOrCreateElement(this.elem, ".validation-option", "<input checked='checked' value='cvc'/>");
  optionCvc.attr("type", "radio");
  optionCvc.attr("name", "validate-option");
  optionCvc.attr("class", "validate-option");
  var span = PaymentezForm.detachOrCreateElement(this.elem, ".checkmark", "<span class='checkmark' />");
  label.append(optionCvc);
  label.append(span);
  wrapper.append(label);
  this.validationOptionByCvc = wrapper;
};

/**
 * Initialise the validation option by Otp
 */
PaymentezForm.prototype.initValidationOtp = function() {
  var wrapper = PaymentezForm.detachOrCreateElement(this.elem, ".validation-wrapper-otp", "<div class='validation-wrapper-otp'></div>");
  var label = PaymentezForm.detachOrCreateElement(this.elem, ".validation-label", "<label>OTP</label>");
  label.attr("class", "validation-label");
  var optionOtp = PaymentezForm.detachOrCreateElement(this.elem, ".validation-option", "<input value='otp'/>");
  optionOtp.attr("type", "radio");
  optionOtp.attr("name", "validate-option");
  optionOtp.attr("class", "validate-option");
  var span = PaymentezForm.detachOrCreateElement(this.elem, ".checkmark", "<span class='checkmark' />");
  label.append(optionOtp);
  label.append(span);
  wrapper.append(label);
  this.validationOptionByOtp = wrapper;
};

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---


PaymentezForm.prototype.setupCardNumberInput = function() {  
  this.elem.append("<div class='card-number-wrapper'></div>");
  var wrapper = this.elem.find(".card-number-wrapper");
  wrapper.append(this.cardNumberInput);
  wrapper.append("<div class='card-type-icon'></div>");
  wrapper.append("<div class='icon'></div>");
  wrapper.find(".icon").append(PaymentezForm.CREDIT_CARD_SVG);
};

PaymentezForm.prototype.setupNameInput = function() {  
  if (this.captureName) {    
    this.elem.append("<div class='name-wrapper'></div>");
    var wrapper = this.elem.find(".name-wrapper");
    wrapper.append(this.nameInput);
    wrapper.append("<div class='icon'></div>");
    wrapper.find(".icon").append(PaymentezForm.USER_SVG);
  }
};

PaymentezForm.prototype.setupEmailInput = function() {  
  if (this.captureEmail) {    
    this.elem.append("<div class='email-container'><div class='email-wrapper'></div></div>");
    var wrapper = this.elem.find(".email-wrapper");
    wrapper.append(this.emailInput);
    wrapper.append("<div class='icon'></div>");
    wrapper.find(".icon").append(PaymentezForm.MAIL_SVG);

  }
};

PaymentezForm.prototype.setupCellPhoneInput = function() {  
  if (this.captureCellPhone) {    
    this.elem.append("<div class='cellphone-container'><div class='cellphone-wrapper'></div></div>");
    var wrapper = this.elem.find(".cellphone-wrapper");
    wrapper.append(this.cellPhoneInput);
    wrapper.append("<div class='icon'></div>");
    wrapper.find(".icon").append(PaymentezForm.CELLPHONE_SVG);
  }
};

PaymentezForm.prototype.setupExpiryInput = function() {
  this.elem.append("<div class='expiry-container'><div class='expiry-wrapper'></div></div>");
  var wrapper = this.elem.find(".expiry-wrapper");

  var expiryInput;

  //
  // Use dropdowns
  //
  if(this.EXPIRY_USE_DROPDOWNS) {
    expiryInput = $("<div></div>");

    var expiryMonthNew = $(
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
    var expiryMonthOld = this.expiryMonthInput;
    PaymentezForm.copyAllElementAttributes(expiryMonthOld, expiryMonthNew);
    this.expiryMonthInput.remove();
    this.expiryMonthInput = expiryMonthNew;

    var expiryYearNew = $("<select><option value='any' selected='' hidden=''>YY</option></select>");
    var currentYear = parseInt(((new Date().getFullYear()).toString()).substring(2, 4));
    for(var i = 0; i < PaymentezForm.EXPIRY_NUMBER_OF_YEARS; i++) {
      expiryYearNew.append("<option value='" + currentYear + "'>" + currentYear + "</option>");
      currentYear = (currentYear + 1) % 100;
    }
    var expiryYearOld = this.expiryYearInput;
    PaymentezForm.copyAllElementAttributes(expiryYearOld, expiryYearNew);
    this.expiryYearInput.remove();
    this.expiryYearInput = expiryYearNew;


    expiryInput.append(this.expiryMonthInput);
    expiryInput.append(this.expiryYearInput);

  }

  // ---

  //
  // Use single text field input for card expiry
  //
  else {
    expiryInput = $("<div></div>");

    // Ensure the expiry month is hidden
    if (this.expiryMonthInput.attr("type") != "hidden") {
      this.expiryMonthInput.attr("type", "hidden");
    }

    // Ensure the expiry year is hidden
    if (this.expiryYearInput.attr("type") != "hidden") {
      this.expiryYearInput.attr("type", "hidden");
    }

    // --- --- ---

    // Construct the single expiry input for both expiry month and year
    this.expiryMonthYearInput = PaymentezForm.detachOrCreateElement(this.elem, ".expiry", "<input class='expiry' />");

    // Ensure the expiry input has a placeholder
    if (!PaymentezForm.elementHasAttribute(this.expiryMonthYearInput, "placeholder")) {
      this.expiryMonthYearInput.attr("placeholder", PaymentezForm.EXPIRY_PLACEHOLDER);
    }

    this.expiryMonthYearInput.attr("type", "tel");
    this.expiryMonthYearInput.attr("maxlength", PaymentezForm.EXPIRY_MASK.length);
    this.expiryMonthYearInput.attr("x-autocompletetype", "cc-exp");
    this.expiryMonthYearInput.attr("autocompletetype", "cc-exp");
    this.expiryMonthYearInput.attr("autocorrect", "off");
    this.expiryMonthYearInput.attr("spellcheck", "off");
    this.expiryMonthYearInput.attr("autocapitalize", "off");

    // ---

    //
    // Events
    //
    var $this = this;
    this.expiryMonthYearInput.keydown(function(e) {
      PaymentezForm.handleExpiryKey(e);

      var val = $this.expiryMonthYearInput.val();

      if(val.length == 1 && parseInt(val) > 1 && PaymentezForm.keyIsNumber(e)) {
        $this.expiryMonthYearInput.val(PaymentezForm.applyFormatMask("0" + val, PaymentezForm.EXPIRY_MASK));
      }

      if(!$this.EXPIRY_USE_DROPDOWNS && $this.expiryMonthYearInput != null) {
        $this.expiryMonthInput.val($this.expiryMonth());


        $this.expiryYearInput.val(val.length == 7 ? val.substr(5,2) : null);
      }
    });

    this.expiryMonthYearInput.blur(function() {
      $this.refreshExpiryMonthValidation();
    });
    this.cvcInput.blur(function() {
      $this.refreshCvcValidation();
    });
    this.nameInput.blur(function() {
      $this.refreshCardHolderNameValidation();
    });
    this.emailInput.blur(function() {
      $this.refreshEmailValidation();
    });
    this.cellPhoneInput.blur(function() {
      $this.refreshCellPhoneValidation();
    });
    this.cardNumberInput.blur(function() {
      $this.refreshCardNumberValidation();
    });

    this.expiryMonthYearInput.on('paste', function() {
      setTimeout(function() {
        $this.refreshExpiryMonthYearInput();
      }, 1);
    });

    expiryInput.append(this.expiryMonthYearInput);
    expiryInput.append(this.expiryMonthInput);
    expiryInput.append(this.expiryYearInput);
  }


  wrapper.append(expiryInput);
  wrapper.append("<div class='icon'></div>");
  wrapper.find(".icon").append(PaymentezForm.CALENDAR_SVG);
};

PaymentezForm.prototype.setupCvcInput = function() {
  this.elem.append("<div class='cvc-container'><div class='cvc-wrapper'></div></div>");
  var wrapper = this.elem.find(".cvc-wrapper");
  wrapper.append(this.cvcInput);
  wrapper.append("<div class='icon'></div>");
  wrapper.find(".icon").append(PaymentezForm.LOCK_SVG);
  //wrapper.append("<div class='icon right popup'></div>");
  //wrapper.find(".icon.right").append(PaymentezForm.INFORMATION_SVG);
};

PaymentezForm.prototype.setupValidationOptionSet = function() {
  var afterWrapper = this.elem.find(".card-number-wrapper");
  if (this.fiscalNumberAdded) {
    afterWrapper = this.elem.find(".fiscal-number-wrapper");
  }
  afterWrapper.after("<div class='validation-container'><fieldset class='validation-fieldset'><legend class='validation-legend'>"+ 
    PaymentezForm.VALIDATION_METHOD_LEGEND + "</legend></fieldset></div>");
  var fieldset = this.elem.find(".validation-fieldset");
  fieldset.append(this.validationOptionByCvc);
  fieldset.append(this.validationOptionByOtp);
  this.validationOptions = this.elem.find("input[name=validate-option]:radio");

  // Events for validationOptions
  var $this = this;
  this.validationOptions.change(function() {
    $this.refreshValidationOption();
  });
};

PaymentezForm.prototype.setupFiscalNumberInput = function() {
  var card = this.elem.find(".card-number-wrapper");
  card.after("<div class='fiscal-number-wrapper'></div>");
  var wrapper = this.elem.find(".fiscal-number-wrapper");
  wrapper.append(this.fiscalNumberInput);
  wrapper.append("<div class='icon'></div>");
  wrapper.find(".icon").append(PaymentezForm.USER_SVG);

  // Events for fiscalNumberInput
  var $this = this;
  this.fiscalNumberInput.blur(function() {
    $this.refreshFiscalNumberValidation();
  });
};

PaymentezForm.prototype.expiryMonth = function() {
  if(!this.EXPIRY_USE_DROPDOWNS && this.expiryMonthYearInput != null) {
    var val = this.expiryMonthYearInput.val();
    return val.length >= 2 ? parseInt(val.substr(0,2)) : null;
    //return (monthValue >= 1 && monthValue <= 12) ? monthValue : null;
  }
  return null;
};


/**
 * Refresh whether the expiry month is valid (update display to reflect)
 */
PaymentezForm.prototype.refreshExpiryMonthValidation = function() {
  if (this.expiryContainerAdded()) {
    if(PaymentezForm.isExpiryValid(this.getExpiryMonth(), this.getExpiryYear())){
      this.setExpiryMonthAsValid();
      return true;
    }else{
      this.setExpiryMonthAsInvalid();
      return false;
    }
  } else { return true; }
};


/**
 * Update the display to highlight the expiry month as valid.
 */
PaymentezForm.prototype.setExpiryMonthAsValid = function() {
  if(this.EXPIRY_USE_DROPDOWNS) {

  } else {
    this.expiryMonthYearInput.parent().removeClass("has-error");
  }
};


/**
 * Update the display to highlight the expiry month as invalid.
 */
PaymentezForm.prototype.setExpiryMonthAsInvalid = function() {
  if (this.EXPIRY_USE_DROPDOWNS) {

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
PaymentezForm.elementHasAttribute = function(element, attributeName) {
  var attr = $(element).attr(attributeName);
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
PaymentezForm.detachOrCreateElement = function(parentElement, selector, html) {
  var element = parentElement.find(selector);
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
PaymentezForm.isValidMonth = function(expiryMonth) {
  return (expiryMonth >= 1 && expiryMonth <= 12);
};


/**
 * Is the given card expiry (month and year) valid?
 *
 * @param month
 * @param year
 * @returns {boolean}
 */
PaymentezForm.isExpiryValid = function(month, year) {
  var today = new Date();
  var currentMonth = (today.getMonth() + 1);
  var currentYear = "" + today.getFullYear();

  if (("" + year).length == 2) {
    year = currentYear.substring(0, 2) + "" + year;
  }

  currentMonth = parseInt(currentMonth);
  currentYear = parseInt(currentYear);
  month = parseInt(month);
  year = parseInt(year);

  return PaymentezForm.isValidMonth(month)
    && ((year > currentYear) || (year == currentYear && month >= currentMonth));
};

