Payment.prototype.constructor = Payment;

Payment.ENV_MODE = "";
Payment.TEST_MODE = true;
Payment.PAYMENT_CLIENT_APP_CODE = "";
Payment.PAYMENT_CLIENT_APP_KEY = "";
Payment.IS_CHECKOUT = false;

Payment.MERCHANT_ID = 500005;
Payment.KOUNT_ENVIRONMENT = "";
Payment.KOUN_TEST_ENVIRONMENT = "https://tst.kaptcha.com/";
Payment.KOUN_PROD_ENVIRONMENT = "https://ssl.kaptcha.com/";

Payment.DOMAIN = "paymentez.com";
Payment.SERVER_LOCAL_URL = "http://localhost:8000";
Payment.SERVER_DEV_URL = `https://ccapi-dev.${Payment.DOMAIN}`;
Payment.SERVER_STG_URL = `https://ccapi-stg.${Payment.DOMAIN}`;
Payment.SERVER_QA_URL = `https://ccapi-qa.${Payment.DOMAIN}`;
Payment.SERVER_PROD_URL = `https://ccapi.${Payment.DOMAIN}`;

Payment.PG_MICROS_STAGING = `https://pg-micros-stg.${Payment.DOMAIN}/v1/unixtime/`;
Payment.PG_MICROS_PRODUCTION = `https://pg-micros.${Payment.DOMAIN}/v1/unixtime/`;

let AUTH_TIMESTAMP_SERVER = "" + String(new Date().getTime());

function _getTime(callback) {
  let xhr = new XMLHttpRequest();
  xhr.onload = function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      let response = JSON.parse(xhr.responseText);
      if (!!response.unixtime) {
        AUTH_TIMESTAMP_SERVER = String(response.unixtime);
      }
    } else {
      AUTH_TIMESTAMP_SERVER = String(new Date().getTime());
    }
    callback();
  };

  if (["local", "dev", "stg"].indexOf(Payment.ENV_MODE) >= 0) {
    xhr.open("GET", Payment.PG_MICROS_STAGING);
  } else if (["prod", "prod-qa"].indexOf(Payment.ENV_MODE) >= 0) {
    xhr.open("GET", Payment.PG_MICROS_PRODUCTION);
  }

  xhr.send();
}

function Payment() {
}

Payment.uuidv4 = function () {
  return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    let r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

Payment.getSessionId = function () {
  return Payment.uuidv4();
};

Payment.getUniqToken = function (auth_timestamp, payment_client_app_key) {
  let uniq_token_string = payment_client_app_key + auth_timestamp;
  return Payment.getHash(uniq_token_string);
};

Payment.getAuthToken = function (payment_client_app_code, app_client_key) {
  let string_auth_token =
    payment_client_app_code +
    ";" +
    AUTH_TIMESTAMP_SERVER +
    ";" +
    Payment.getUniqToken(AUTH_TIMESTAMP_SERVER, app_client_key);
  return btoa(string_auth_token);
};

Payment.getHash = function (message) {
  let sha256 = new jsSHA("SHA-256", "TEXT");
  sha256.update(message);
  return sha256.getHash("HEX");
};

Payment.getServerURL = function () {
  let SERVER_URL = Payment.SERVER_STG_URL;
  if (Payment.ENV_MODE === "") {
    if (Payment.TEST_MODE) {
      SERVER_URL = Payment.SERVER_STG_URL;
    } else {
      SERVER_URL = Payment.SERVER_PROD_URL;
    }
  } else {
    if (Payment.ENV_MODE === "dev") {
      SERVER_URL = Payment.SERVER_DEV_URL;
    } else if (Payment.ENV_MODE === "stg") {
      SERVER_URL = Payment.SERVER_STG_URL;
    } else if (Payment.ENV_MODE === "prod") {
      SERVER_URL = Payment.SERVER_PROD_URL;
    } else if (Payment.ENV_MODE === "prod-qa") {
      SERVER_URL = Payment.SERVER_QA_URL;
    } else {
      SERVER_URL = Payment.SERVER_LOCAL_URL;
    }
  }
  return SERVER_URL;
};

Payment.createToken = function (
  createTokenRequest,
  successCallback,
  erroCallback
) {
  let initFunction = function () {
    let SERVER_URL = this.getServerURL();
    let xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", SERVER_URL + "/v2/card/add", true);
    xmlhttp.setRequestHeader("Content-Type", "application/json");
    xmlhttp.setRequestHeader(
      "Auth-Token",
      Payment.getAuthToken(
        Payment.PAYMENT_CLIENT_APP_CODE,
        Payment.PAYMENT_CLIENT_APP_KEY
      )
    );

    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === XMLHttpRequest.DONE) {
        // XMLHttpRequest.DONE == 4
        try {
          let objResponse = JSON.parse(xmlhttp.responseText);
          if (xmlhttp.status === 200) {
            successCallback(objResponse);
          } else if (xmlhttp.status === 400) {
            erroCallback(objResponse);
          } else {
            erroCallback(objResponse);
          }
        } catch (e) {
          let server_error = {
            error: {
              type: "Server Error",
              help: "Server Error",
              description: "Server Error"
            }
          };
          erroCallback(server_error);
        }
      }
    };
    xmlhttp.send(JSON.stringify(createTokenRequest));
  };
  initFunction = initFunction.bind(this);
  _getTime(initFunction);
};

Payment.dataCollector = function (session_id) {
  if (Payment.ENV_MODE === "") {
    if (Payment.TEST_MODE) {
      Payment.KOUNT_ENVIRONMENT = Payment.KOUN_TEST_ENVIRONMENT;
    } else {
      Payment.KOUNT_ENVIRONMENT = Payment.KOUN_PROD_ENVIRONMENT;
    }
  } else {
    if (Payment.ENV_MODE === "prod") {
      Payment.KOUNT_ENVIRONMENT = Payment.KOUN_PROD_ENVIRONMENT;
    } else {
      Payment.KOUNT_ENVIRONMENT = Payment.KOUN_TEST_ENVIRONMENT;
    }
  }

  let body, e, iframe, image;
  if (
    typeof document !== "undefined" &&
    typeof document.body !== "undefined" &&
    document.body &&
    (document.readyState === "interactive" ||
      document.readyState === "complete")
  ) {
    body = document.getElementsByTagName("body")[0];
    iframe = document.createElement("iframe");
    iframe.setAttribute("id", "riskIframe");
    iframe.setAttribute("height", "1");
    iframe.setAttribute("scrolling", "no");
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("width", "1");
    iframe.setAttribute(
      "src",
      Payment.KOUNT_ENVIRONMENT +
      "logo.htm?m=" +
      Payment.MERCHANT_ID +
      "&s=" +
      session_id
    );
    image = document.createElement("img");
    image.setAttribute("height", "1");
    image.setAttribute("width", "1");
    image.setAttribute(
      "src",
      Payment.KOUNT_ENVIRONMENT +
      "logo.gif?m=" +
      Payment.MERCHANT_ID +
      "&s=" +
      session_id
    );
    try {
      iframe.appendChild(image);
    } catch (_error) {
      e = _error;
    }
    body.appendChild(iframe);
  } else {
    setTimeout(Payment.dataCollector, 150, session_id);
  }
};

/**
 * Setting your credentials and environment
 *
 * @param test_mode false to use production environment
 * @param payment_client_app_code provided by Payment.
 * @param payment_client_app_key provided by Payment.
 */
Payment.setEnvironment = function (
  test_mode,
  payment_client_app_code,
  payment_client_app_key
) {
  Payment.TEST_MODE = test_mode;
  Payment.PAYMENT_CLIENT_APP_CODE = payment_client_app_code;
  Payment.PAYMENT_CLIENT_APP_KEY = payment_client_app_key;
};

/**
 * Setting your credentials and environment
 *
 * @param env_mode `prod`, `stg`, `dev`, `local` to change environment. Default is `stg`
 * @param payment_client_app_code provided by Payment.
 * @param payment_client_app_key provided by Payment.
 */
Payment.init = function (
  env_mode,
  payment_client_app_code,
  payment_client_app_key
) {
  Payment.ENV_MODE = env_mode;
  Payment.PAYMENT_CLIENT_APP_CODE = payment_client_app_code;
  Payment.PAYMENT_CLIENT_APP_KEY = payment_client_app_key;
};

/**
 * The simplest way to create a token, using a Card
 *
 * @param uid User identifier. This is the identifier you use inside your application; you will receive it in notifications.
 * @param email Email of the user initiating the purchase. Format: Valid e-mail format.
 * @param card the Card used to create this payment token
 * @param success_callback a callback to receive the token
 * @param failure_callback a callback to receive an error
 */
Payment.addCard = function (
  uid,
  email,
  card,
  success_callback,
  failure_callback
) {
  let session_id = Payment.getSessionId();
  Payment.dataCollector(session_id);
  let params = {
    session_id: session_id,
    user: {
      id: uid,
      email: email,
      fiscal_number: $(".fiscal-number").val()
    }
  };
  params["card"] = card["card"];
  Payment.createToken(params, success_callback, failure_callback);
};

Payment.getBinInformation = function (
  number_bin,
  form,
  successCallback,
  erroCallback
) {
  let initFunction = function () {
    let xmlhttp = new XMLHttpRequest();
    if (this.IS_CHECKOUT) {
      let reference = $("#reference").val();
      let url_bin =
        "/v2/card_bin/intra/" + number_bin + "/?reference=" + reference;
      xmlhttp.open("GET", url_bin, true);
    } else {
      let SERVER_URL = this.getServerURL();
      let url_bin = SERVER_URL + "/v2/card_bin/" + number_bin;
      xmlhttp.open("GET", url_bin, true);
      xmlhttp.setRequestHeader(
        "Auth-Token",
        this.getAuthToken(
          this.PAYMENT_CLIENT_APP_CODE,
          this.PAYMENT_CLIENT_APP_KEY
        )
      );
    }
    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === XMLHttpRequest.DONE) {
        try {
          let objResponse = JSON.parse(xmlhttp.responseText);
          if (xmlhttp.status === 200) {
            successCallback(objResponse, form);
          } else if (xmlhttp.status === 400) {
            erroCallback(objResponse);
          } else {
            erroCallback(objResponse);
          }
        } catch (e) {
          let server_error = {
            error: {
              type: "Server Error",
              help: "Server Error",
              description: "Server Error"
            }
          };
          erroCallback(server_error);
        }
      }
    };
    xmlhttp.send();
  };
  initFunction = initFunction.bind(this);
  if (!this.IS_CHECKOUT) {
    _getTime(initFunction);
  } else {
    initFunction();
  }
};
