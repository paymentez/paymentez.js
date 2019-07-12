Paymentez.prototype.constructor = Paymentez;

Paymentez.ENV_MODE = "";
Paymentez.TEST_MODE = true;
Paymentez.PAYMENTEZ_CLIENT_APP_CODE = "";
Paymentez.PAYMENTEZ_CLIENT_APP_KEY = "";

Paymentez.MERCHANT_ID = 500005;
Paymentez.KOUNT_ENVIRONMENT = "";
Paymentez.KOUN_TEST_ENVIRONMENT = "https://tst.kaptcha.com/";
Paymentez.KOUN_PROD_ENVIRONMENT = "https://ssl.kaptcha.com/";

Paymentez.SERVER_LOCAL_URL = "http://localhost:8000";
Paymentez.SERVER_DEV_URL = "https://ccapi-dev.paymentez.com";
Paymentez.SERVER_STG_URL = "https://ccapi-stg.paymentez.com";
Paymentez.SERVER_QA_URL = "https://ccapi-qa.paymentez.com";
Paymentez.SERVER_PROD_URL = "https://ccapi.paymentez.com";

Paymentez.TIME_STAMP_SERVER =
  "https://cors-anywhere.herokuapp.com/" + "http://worldtimeapi.org/api/ip";
Paymentez.auth_timestamp = "" + String(new Date().getTime());

var xhr = new XMLHttpRequest();
xhr.onload = function() {
  if (xhr.status >= 200 && xhr.status < 300) {
    var response = JSON.parse(xhr.responseText);
    Paymentez.auth_timestamp = String(response.unixtime);
    console.log("success!", Paymentez.auth_timestamp);
  }
};

xhr.open('GET', Paymentez.TIME_STAMP_SERVER);
xhr.send();

function Paymentez() {}

Paymentez.uuidv4 = function() {
  return "xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    let r = (Math.random() * 16) | 0,
      v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

Paymentez.getSessionId = function() {
  return Paymentez.uuidv4();
};

Paymentez.getUniqToken = function(auth_timestamp, paymentez_client_app_key) {
  let uniq_token_string = paymentez_client_app_key + auth_timestamp;
  return Paymentez.getHash(uniq_token_string);
};

Paymentez.getAuthToken = function(paymentez_client_app_code, app_client_key) {
  let string_auth_token =
    paymentez_client_app_code +
    ";" +
    Paymentez.auth_timestamp +
    ";" +
    Paymentez.getUniqToken(auth_timestamp, app_client_key);
  return btoa(string_auth_token);
};

Paymentez.getHash = function(message) {
  let sha256 = new jsSHA("SHA-256", "TEXT");
  sha256.update(message);
  return sha256.getHash("HEX");
};

Paymentez.getServerURL = function() {
  let SERVER_URL = Paymentez.SERVER_STG_URL;
  if (Paymentez.ENV_MODE === "") {
    if (Paymentez.TEST_MODE) {
      SERVER_URL = Paymentez.SERVER_STG_URL;
    } else {
      SERVER_URL = Paymentez.SERVER_PROD_URL;
    }
  } else {
    if (Paymentez.ENV_MODE === "dev") {
      SERVER_URL = Paymentez.SERVER_DEV_URL;
    } else if (Paymentez.ENV_MODE === "stg") {
      SERVER_URL = Paymentez.SERVER_STG_URL;
    } else if (Paymentez.ENV_MODE === "prod") {
      SERVER_URL = Paymentez.SERVER_PROD_URL;
    } else if (Paymentez.ENV_MODE === "prod-qa") {
      SERVER_URL = Paymentez.SERVER_QA_URL;
    } else {
      SERVER_URL = Paymentez.SERVER_LOCAL_URL;
    }
  }
  return SERVER_URL;
};

Paymentez.createToken = function(
  createTokenRequest,
  successCallback,
  erroCallback
) {
  let SERVER_URL = this.getServerURL();
  let xmlhttp = new XMLHttpRequest();
  xmlhttp.open("POST", SERVER_URL + "/v2/card/add", true);
  xmlhttp.setRequestHeader("Content-Type", "application/json");
  xmlhttp.setRequestHeader(
    "Auth-Token",
    Paymentez.getAuthToken(
      Paymentez.PAYMENTEZ_CLIENT_APP_CODE,
      Paymentez.PAYMENTEZ_CLIENT_APP_KEY
    )
  );

  xmlhttp.onreadystatechange = function() {
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

Paymentez.dataCollector = function(session_id) {
  if (Paymentez.ENV_MODE === "") {
    if (Paymentez.TEST_MODE) {
      Paymentez.KOUNT_ENVIRONMENT = Paymentez.KOUN_TEST_ENVIRONMENT;
    } else {
      Paymentez.KOUNT_ENVIRONMENT = Paymentez.KOUN_PROD_ENVIRONMENT;
    }
  } else {
    if (Paymentez.ENV_MODE === "prod") {
      Paymentez.KOUNT_ENVIRONMENT = Paymentez.KOUN_PROD_ENVIRONMENT;
    } else {
      Paymentez.KOUNT_ENVIRONMENT = Paymentez.KOUN_TEST_ENVIRONMENT;
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
      Paymentez.KOUNT_ENVIRONMENT +
        "logo.htm?m=" +
        Paymentez.MERCHANT_ID +
        "&s=" +
        session_id
    );
    image = document.createElement("img");
    image.setAttribute("height", "1");
    image.setAttribute("width", "1");
    image.setAttribute(
      "src",
      Paymentez.KOUNT_ENVIRONMENT +
        "logo.gif?m=" +
        Paymentez.MERCHANT_ID +
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
    setTimeout(Paymentez.dataCollector, 150, session_id);
  }
};

/**
 * Setting your credentials and environment
 *
 * @param test_mode false to use production environment
 * @param paymentez_client_app_code provided by Paymentez.
 * @param paymentez_client_app_key provided by Paymentez.
 */
Paymentez.setEnvironment = function(
  test_mode,
  paymentez_client_app_code,
  paymentez_client_app_key
) {
  Paymentez.TEST_MODE = test_mode;
  Paymentez.PAYMENTEZ_CLIENT_APP_CODE = paymentez_client_app_code;
  Paymentez.PAYMENTEZ_CLIENT_APP_KEY = paymentez_client_app_key;
};

/**
 * Setting your credentials and environment
 *
 * @param env_mode `prod`, `stg`, `dev`, `local` to change environment. Default is `stg`
 * @param paymentez_client_app_code provided by Paymentez.
 * @param paymentez_client_app_key provided by Paymentez.
 */
Paymentez.init = function(
  env_mode,
  paymentez_client_app_code,
  paymentez_client_app_key
) {
  Paymentez.ENV_MODE = env_mode;
  Paymentez.PAYMENTEZ_CLIENT_APP_CODE = paymentez_client_app_code;
  Paymentez.PAYMENTEZ_CLIENT_APP_KEY = paymentez_client_app_key;
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
Paymentez.addCard = function(
  uid,
  email,
  card,
  success_callback,
  failure_callback
) {
  let session_id = Paymentez.getSessionId();
  Paymentez.dataCollector(session_id);
  let params = {
    session_id: session_id,
    user: {
      id: uid,
      email: email,
      fiscal_number: $(".fiscal-number").val()
    }
  };
  params["card"] = card["card"];
  Paymentez.createToken(params, success_callback, failure_callback);
};

Paymentez.isCheckout = function() {
  return this.ENV_MODE === "";
};

Paymentez.getBinInformation = function(
  number_bin,
  form,
  successCallback,
  erroCallback
) {
  let xmlhttp = new XMLHttpRequest();
  if (this.isCheckout()) {
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
        this.PAYMENTEZ_CLIENT_APP_CODE,
        this.PAYMENTEZ_CLIENT_APP_KEY
      )
    );
  }
  xmlhttp.onreadystatechange = function() {
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
