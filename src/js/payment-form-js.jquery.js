(function ($) {

  let methods = {
    init: function () {
      this.data("paymentform", new PaymentForm(this));
      return this;
    },
    card: function () {
      return this.data("paymentform").getCard();
    },
    cardNumber: function () {
      return this.data("paymentform").getCardNumber();
    },
    cardType: function () {
      return this.data("paymentform").getCardType();
    },
    name: function () {
      return this.data("paymentform").getName();
    },
    expiryMonth: function () {
      return this.data("paymentform").getExpiryMonth();
    },
    expiryYear: function () {
      return this.data("paymentform").getExpiryYear();
    },
    fiscalNumber: function () {
      return this.data("paymentform").getFiscalNumber();
    },
    cellPhone: function () {
      return this.data("paymentform").getCellPhone();
    },
    validationOption: function () {
      return this.data("paymentform").getValidationOption();
    },
    showVerification: function (objResponse, successCallback, errorCallback) {
      return this.data("paymentform").showVerification(objResponse, successCallback, errorCallback);
    }
  };


  /**
   * jQuery function.
   *
   * @param methodOrOptions
   * @returns {*}
   */
  $.fn.PaymentForm = function (methodOrOptions) {
    if (methods[methodOrOptions]) {
      return methods[methodOrOptions].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof methodOrOptions === "object" || !methodOrOptions) {
      return methods.init.apply(this, arguments);
    } else {
      $.error("Method " + methodOrOptions + " does not exist on jQuery.Payment");
    }
  };


}(jQuery));

//
// Initialise for all elements with payment-js class.
//
$(function () {
  $(".payment-form").not('.checkout').each(function (i, obj) {
    $(obj).PaymentForm();
  });
});
