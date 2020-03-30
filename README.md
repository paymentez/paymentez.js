# PaymentezJS
===================

PaymentezJS is a library that allows developers to easily connect to the Paymentez CREDITCARDS API

[View working example >](https://developers.paymentez.com/docs/payments/#javascript)

## Installation

You will need to include jQuery and both `payment_stable.min.js` and `payment_stable.min.css` into your webpage specifying "UTF-8" like charset.

```html
<script src="https://code.jquery.com/jquery-1.11.3.min.js" charset="UTF-8"></script>

<link href="https://cdn.paymentez.com/ccapi/sdk/payment_stable.min.css" rel="stylesheet" type="text/css" />
<script src="https://cdn.paymentez.com/ccapi/sdk/payment_stable.min.js" charset="UTF-8"></script>
```


## Usage

For working examples of using PaymentezJS, see the [examples](https://github.com/paymentez/paymentez.js/tree/master/examples) folder of this project.

### Using the Paymentez Form
Any elements with the class `payment-form` will be automatically converted into a basic credit card input with the expiry date and CVC check.

The easiest way to get started with PaymentForm is to insert the snippet of code:
```html
<div class="payment-form" id="my-card" data-capture-name="true"></div>
```

To get a `Card` object from the `PaymentForm`, you ask the form for its card.

```javascript
var myCard = $('#my-card');
var cardToSave = myCard.PaymentForm('card');
if(cardToSave == null){
  alert("Invalid Card Data");
}
```

If the returned `Card` is null, error states will show on the fields that need to be fixed. 

Once you have a non-null `Card` object from the widget, you can call [addCard](#addcard).

### Init library
You should initialize the library. 

```javascript
/**
  * Init library
  *
  * @param env_mode `prod`, `stg`, `local` to change environment. Default is `stg`
  * @param paymentez_client_app_code provided by Paymentez.
  * @param paymentez_client_app_key provided by Paymentez.
  */
Payment.init('stg', 'PAYMENTEZ_CLIENT_APP_CODE', 'PAYMENTEZ_CLIENT_APP_KEY');
```

### addCard

addCard converts sensitive card data to a single-use token which you can safely pass to your server to charge the user. 

```javascript
/* Add Card converts sensitive card data to a single-use token which you can safely pass to your server to charge the user.
 *
 * @param uid User identifier. This is the identifier you use inside your application; you will receive it in notifications.
 * @param email Email of the user initiating the purchase. Format: Valid e-mail format.
 * @param card the Card used to create this payment token
 * @param success_callback a callback to receive the token
 * @param failure_callback a callback to receive an error
 */
Payment.addCard(uid, email, cardToSave, successHandler, errorHandler);

var successHandler = function(cardResponse) {
  console.log(cardResponse.card);
  if(cardResponse.card.status === 'valid'){
    $('#messages').html('Card Successfully Added<br>'+
                  'status: ' + cardResponse.card.status + '<br>' +
                  "Card Token: " + cardResponse.card.token + "<br>" +
                  "transaction_reference: " + cardResponse.card.transaction_reference
                );    
  }else if(cardResponse.card.status === 'review'){
    $('#messages').html('Card Under Review<br>'+
                  'status: ' + cardResponse.card.status + '<br>' +
                  "Card Token: " + cardResponse.card.token + "<br>" +
                  "transaction_reference: " + cardResponse.card.transaction_reference
                ); 
  }else if(cardResponse.card.status === 'pending'){
    $('#messages').html('Card Pending To Approve<br>'+
                  'status: ' + cardResponse.card.status + '<br>' +
                  "Card Token: " + cardResponse.card.token + "<br>" +
                  "transaction_reference: " + cardResponse.card.transaction_reference
                ); 
  }else{
    $('#messages').html('Error<br>'+
                  'status: ' + cardResponse.card.status + '<br>' +
                  "message Token: " + cardResponse.card.message + "<br>"
                ); 
  }
  submitButton.removeAttr("disabled");
  submitButton.text(submitInitialText);
};

var errorHandler = function(err) {    
  console.log(err.error);
  $('#messages').html(err.error.type);    
  submitButton.removeAttr("disabled");
  submitButton.text(submitInitialText);
};
```

The third argument to addCard is a Card object. A Card contains the following fields:

+ number: card number as a string without any separators, e.g. '4242424242424242'.
+ holder_name: cardholder name.
+ expiry_month: integer representing the card's expiration month, e.g. 12.
+ expiry_year: integer representing the card's expiration year, e.g. 2013.
+ cvc: card security code as a string, e.g. '123'.


### getSessionId

The Session ID is a parameter Paymentez use for fraud purposes. 
Call this method if you want to Collect your user's Device Information.

```javascript
var session_id = Payment.getSessionId();
```

Once you have the Session ID, you can pass it to your server to charge the user.


## PaymentForm Complete Reference

### Manual Insertion

If you wish to manually alter the fields used by PaymentForm to add additional classes or set the input field placeholder, name or id. you can pre-populate the form fields as show below.

This could be helpful in case you want to Render the Form in another Language (by default the Form is Rendered in Spanish), or to reference some input by name or id.

For example if you want to render the form in English and add a custom class to the card-number
```html
<div class="payment-form">
  <input class="card-number my-custom-class" name="card-number" placeholder="Card number">
  <input class="name" id="the-card-name-id" placeholder="Card Holders Name">
  <input class="expiry-month" name="expiry-month">
  <input class="expiry-year" name="expiry-year">
  <input class="cvc" name="cvc">
</div>
```


### Select Fields
You can determinate the fields to show on your form.

| Field                             | Description                                                |
| :-------------------------------- | :--------------------------------------------------------- |
| data-capture-name                 | Card Holder Name                                           |
| data-capture-email                | User Email                                                 |
| data-capture-cellphone            | User Cellphone                                             |
| data-icon-colour                  | Icons color                                                |
| data-use-dropdowns                | Use dropdowns to set the Card Expiration Date              |
| data-exclusive-types              | Define allowed card types                                  |
| data-invalid-card-type-message    | Define a custom message to show for invalid card types     |

The 'data-use-dropdowns' can solve an issue with the expiration mask in not so recent mobiles.

Integrate in the form is so simple like this
```html
<div class="payment-form"
id="my-card"
data-capture-name="true"
data-capture-email="true"
data-capture-cellphone="true"
data-icon-colour="#569B29"
data-use-dropdowns="true">
```

### Specific the card types
If you want specify the card types allowed in the form, like Exito or Alkosto. You can do something like next example.
when a card type not allowed is seted, the form is reset, block the inputs and show a message, the default message is
*Tipo de tarjeta invalida para está operación.*

```html
<div class="payment-form"
id="my-card"
data-capture-name="true"
data-exclusive-types="ex,ak"
data-invalid-card-type-message="Tarjeta invalida. Por favor ingresa una tarjeta Exito / Alkosto."
>
```

Follow this link to see all [card types](https://paymentez.github.io/api-doc/#card-brands) allowed by Paymentez.


### Reading Values

PaymentForm provides functionality allowing you to read the form field values directly with JavaScript. This can be useful if you wish to submit the values via Ajax.

Create a PaymentForm element and give it a unique id (in this example `my-card`)

```html
<div class="payment-form" id="my-card" data-capture-name="true"></div>
```

The javascript below demonstrates how to read each value of the form into local variables.

```javascript
var myCard = $('#my-card');

var cardNumber = myCard.PaymentForm('cardNumber');
var cardType = myCard.PaymentForm('cardType');
var name = myCard.PaymentForm('name');
var expiryMonth = myCard.PaymentForm('expiryMonth');
var expiryYear = myCard.PaymentForm('expiryYear');
var fiscalNumber = myCard.PaymentForm('fiscalNumber');
var validationOption = myCard.PaymentForm('validationOption');
```


### Functions

To call a function on a PaymentForm element, follow the pattern below.
Replace the text 'function' with the name of the function you wish to call.

```javascript
$('#my-card').PaymentForm('function')
```

The functions available are listed below:

| Function          | Description                                    |
| :---------------- | :--------------------------------------------- |
| card              | Get the card object                            |
| cardNumber        | Get the card number entered                    |
| cardType          | Get the type of the card number entered        |
| name              | Get the name entered                           |
| expiryMonth       | Get the expiry month entered                   |
| expiryYear        | Get the expiry year entered                    |
| fiscalNumber      | Get the fiscal number                          |
| validationOption  | Get the validation option                      |



#### CardType Function

The `cardType` function will return one of the following strings based on the card number entered.
If the card type cannot be determined an empty string will be given instead.

| Card Type              |
| :--------------------- |
| AMEX                   |
| Diners                 |
| Diners - Carte Blanche |
| Discover               |
| JCB                    |
| Mastercard             |
| Visa                   |
| Visa Electron          |
| Exito                  |



### Static functions

If you just want to perform simple operations without the PaymentForm form, there are a number of static functions provided
by the PaymentForm library that are made available.


#### Card Type from Card Number
```javascript
var cardNumber = '4242 4242 4242 4242'; // Spacing is not important
var cardType = PaymentForm.cardTypeFromNumber(cardNumber);
```

#### Cleaning and Masking
```javascript
// var formatMask = 'XXXX XXXX XXXX XXXX'; // You can manually define an input mask
// var formatMask = 'XX+X X XXXX XXXX XXXX'; // You can add characters other than spaces to the mask
var formatMask = PaymentForm.CREDIT_CARD_NUMBER_VISA_MASK; // Or use a standard mask.
var cardNumber = '424 2424242 42   42 42';
var cardNumberWithoutSpaces = PaymentForm.numbersOnlyString(cardNumber);
var formattedCardNumber = PaymentForm.applyFormatMask(cardNumberWithoutSpaces, formatMask);
```

##### Masks

| Variable Name                                    | Mask
| :----------------------------------------------- | :------------------ |
| PaymentForm.CREDIT_CARD_NUMBER_DEFAULT_MASK    | XXXX XXXX XXXX XXXX |
| PaymentForm.CREDIT_CARD_NUMBER_VISA_MASK       | XXXX XXXX XXXX XXXX |
| PaymentForm.CREDIT_CARD_NUMBER_MASTERCARD_MASK | XXXX XXXX XXXX XXXX |
| PaymentForm.CREDIT_CARD_NUMBER_DISCOVER_MASK   | XXXX XXXX XXXX XXXX |
| PaymentForm.CREDIT_CARD_NUMBER_JCB_MASK        | XXXX XXXX XXXX XXXX |
| PaymentForm.CREDIT_CARD_NUMBER_AMEX_MASK       | XXXX XXXXXX XXXXX   |
| PaymentForm.CREDIT_CARD_NUMBER_DINERS_MASK     | XXXX XXXX XXXX XX   |
| PaymentForm.CREDIT_CARD_NUMBER_EXITO_MASK      | XXXX XXXX XXXX XXXX |



### Card Expiry Validation
The expiry month can be in the range: 1 = January to 12 = December
In the case of 'Exito' cards, they do not have an expiration date

```javascript
var month = 3;
var year = 2019;
var valid = PaymentForm.isExpiryValid(month, year);
```

The expiry month and year can be either and integer or a string.
```javascript
var month = "3";
var year = "2019";
var valid = PaymentForm.isExpiryValid(month, year);
```

The expiry year can be either 4 digits or 2 digits long.
```javascript
var month = "3";
var year = "19";
var valid = PaymentForm.isExpiryValid(month, year);
```

### Card Validations Options
There are three card validation options

| Validation Option      | Description
| :--------------------- | :----------------------------------------------------- |
| PaymentForm.AUTH_CVC | Card validation by cvc, the most common option         |
| PaymentForm.AUTH_NIP | Card validation by nip (Available only by Exito cards) |
| PaymentForm.AUTH_OTP | Card validation by otp (Available only by Exito cards) |
