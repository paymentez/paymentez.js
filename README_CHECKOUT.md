# Paymentez Checkout

## Integrating Checkout

Paymentez Checkout, simplifies and secures online payment processing. Quickly integrate Checkout into your site to provide your users with a streamlined, mobile-ready payment experience that is constantly improving.

The easiest way to integrate Paymentez is via Checkout, an embedded tool that takes care of building an HTML form, validating user input, and securing your customers' card data. Using Checkout, sensitive credit card information is sent directly to Paymentez, and does not touch your server. Paymentez returns to your site a transaction object with the result of the operation.

To see Checkout in action, click the button above, filling in the resulting form with:

* Any random, syntactically valid email address (the more random, the better)
* Any Phone Number, such as 777777777
* Any Card Holder´s Name
* One of [Paymentez's test card numbers](https://paymentez.github.io/api-doc/#test-cards), such as 4111111111111111
* Any three-digit CVC code
* Any expiration date in the future

[View working example >](https://developers.paymentez.com/docs/payments/#checkout)


## Integration

The custom integration requires solid JavaScript skills.

When your page loads, you should create a handler object using `paymentezCheckout.modal()`. You can then call `open()` on the handler in response to any event. If you need to abort the Checkout process—for example, when navigation occurs in a single-page application, call `close()` on the handler.


```html
<script src="https://cdn.paymentez.com/js/1.0.1/paymentez-checkout.min.js"></script>

<button class="js-paymentez-checkout">Purchase</button>


<script>    
  var paymentezCheckout = new PaymentezCheckout.modal({
      client_app_code: 'PAYMENTEZ_CLIENT_APP_CODE',       
      client_app_key: 'PAYMENTEZ_CLIENT_APP_KEY',
      locale: 'es', //es, pt, en
      env_mode: 'dev', // dev, prod
      onOpen: function() {
          console.log('modal open');
      },
      onClose: function() {
          console.log('modal closed');
      },
      onResponse: function(response) {
          // You can access the Transaction Status with `response.transaction.status`.
          // Example response: {"transaction":{"status":"success","id":"CB-81011","status_detail":3}}
          console.log('modal response');
          document.getElementById('response').innerHTML = JSON.stringify(response);            
      }
  });

  var btnOpenCheckout = document.querySelector('.js-paymentez-checkout');
  btnOpenCheckout.addEventListener('click', function(){
    // Open Checkout with further options:
    paymentezCheckout.open({
      user_id: '1234',
      user_email: 'test@paymentez.com', //optional        
      user_phone: '7777777777', //optional
      order_description: '1 Green Salad',
      order_amount: 1500,
      order_vat: 0,
      order_reference: '#234323411'
    });
  });
  
  // Close Checkout on page navigation:
  window.addEventListener('popstate', function() {
    paymentezCheckout.close();
  });
</script>

```

## Configuration options

Change how Checkout looks and behaves using the following configuration options.

### PaymentezCheckout.modal
| Parameter       | Required | Description                                                               |
|-----------------|----------|---------------------------------------------------------------------------|
| client_app_code | yes      | Client Credentials Provied by Paymentez                                   |
| client_app_key  | yes      | Client Credentials Provied by Paymentez                                   |
| env_mode        | yes      | `prod` for production environment OR `dev` for testing environment        |
| locale          | no       | User's preferred language (`es`, `en`, `pt`). English will be used by default. |
| onOpen          | no       | `function()` The callback to invoke when Checkout is opened               |
| onClose         | no       | `function()` The callback to invoke when Checkout is closed               |
| onResponse      | yes      | function([responseObject](#responseObject)) The callback to invoke when the Checkout process is complete |

#### responseObject
```json
{  
   "transaction":{  
      "status":"success",
      "id":"CB-81011",
      "status_detail":3
   }
}
```


### PaymentezCheckout.open
| Parameter         | Required | Description                                                                                         |
|-------------------|----------|-----------------------------------------------------------------------------------------------------|
| user_id           | yes      | Customer identifier. This is the identifier you use inside your application.                        |
| user_email        | no       | If you already know the email address of your user, you can provide it to Checkout to be prefilled. |
| user_phone        | no       | If you already know the phone of your user, you can provide it to Checkout to be prefilled.         |
| order_description | yes      | A description of the product or service being purchased.                                            |
| order_amount      | yes      | The amount that's shown to the user. Format: Decimal with two fraction digits.                      |
| order_vat         | yes      | Sales tax amount, included in product cost. Format: Decimal with two fraction digits.               |
| order_reference   | yes      | Merchant order reference. You will identify this purchase using this reference.                     |


## HTTPS requirements

All submissions of payment info using Checkout are made via a secure HTTPS connection. However, in order to protect yourself from certain forms of man-in-the-middle attacks, you must serve the page containing the payment form over HTTPS as well. In short, the address of the page containing Checkout must start with `https://` rather than just `http://`.

## Supported browsers

Checkout strives to support all recent versions of major browsers. For the sake of security and providing the best experience to the majority of customers, we do not support browsers that are no longer receiving security updates and represent a small minority of traffic.

If you have an issue with Checkout on a specific browser, please [contact us](http://soporte.paymentez.com/support/tickets/new) so we can improve its support.

## Prevent Checkout from being blocked

You can prevent Checkout's popup from being blocked by calling `paymentezCheckout.open` when the user clicks on an element on the page. Do not call `paymentezCheckout.open` in a callback. This design indicates to the browser that the user is explicitly requesting the popup. Otherwise, mobile devices and some versions of Internet Explorer will block the popup and prevent users from checking out.