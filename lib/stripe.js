'use strict';

Stripe.DEFAULT_HOST = 'api.stripe.com';
Stripe.DEFAULT_PORT = '443';
Stripe.DEFAULT_BASE_PATH = '/v1/';
Stripe.DEFAULT_API_VERSION = null;
Stripe.PACKAGE_VERSION = require('fs').readFileSync(
  require('path').resolve(__dirname, '../VERSION'), 'utf-8'
);

Stripe.USER_AGENT = {
  bindings_version: Stripe.PACKAGE_VERSION,
  lang: 'node',
  lang_version: process.version,
  platform: process.platform,
  publisher: 'stripe',
  uname: null
};

Stripe.USER_AGENT_SERIALIZED = null;

var exec = require('child_process').exec;

var resources = {

  Account: require('./resources/Account'),
  Balance: require('./resources/Balance'),
  Charges: require('./resources/Charges'),
  Coupons: require('./resources/Coupons'),
  Customers: require('./resources/Customers'),
  Events: require('./resources/Events'),
  Invoices: require('./resources/Invoices'),
  InvoiceItems: require('./resources/InvoiceItems'),
  Plans: require('./resources/Plans'),
  Recipients: require('./resources/Recipients'),
  Tokens: require('./resources/Tokens'),
  Transfers: require('./resources/Transfers'),

  // The following rely on pre-filled customer IDs:
  CustomerCards: require('./resources/CustomerCards')

};

Stripe.StripeResource = require('./StripeResource');
Stripe.resources = resources;

function Stripe(key, version) {

  if (!(this instanceof Stripe)) {
    return new Stripe(key);
  }

  this._api = {
    auth: null,
    host: Stripe.DEFAULT_HOST,
    port: Stripe.DEFAULT_PORT,
    basePath: Stripe.DEFAULT_BASE_PATH,
    version: Stripe.DEFAULT_API_VERSION,
    dev: false
  };

  this._prepResources();
  this.setApiKey(key);

}

Stripe.prototype = {

  setHost: function(host, port, protocol) {
    this._setApiField('host', host);
    if (port) this.setPort(port);
    if (protocol) this.setProtocol(protocol);
  },

  setProtocol: function(protocol) {
    this._setApiField('protocol', protocol.toLowerCase());
  },

  setPort: function(port) {
    this._setApiField('port', port);
  },

  setApiVersion: function(version) {
    this._setApiField('version', version);
  },

  setApiKey: function(key) {
    if (key) {
      this._setApiField(
        'auth',
        'Basic ' + new Buffer(key + ':').toString('base64')
      );
    }
  },

  _setApiField: function(key, value) {
    this._api[key] = value;
  },

  getApiField: function(key) {
    return this._api[key];
  },

  getConstant: function(c) {
    return Stripe[c];
  },

  getClientUserAgent: function(cb) {
    if (Stripe.USER_AGENT_SERIALIZED) {
      return cb(Stripe.USER_AGENT_SERIALIZED);
    }
    exec('uname -a', function(err, uname) {
      Stripe.USER_AGENT.uname = uname || 'UNKNOWN';
      Stripe.USER_AGENT_SERIALIZED = JSON.stringify(Stripe.USER_AGENT);
      cb(Stripe.USER_AGENT_SERIALIZED);
    });
  },

  _prepResources: function() {

    for (var name in resources) {
      this[
        name[0].toLowerCase() + name.substring(1)
      ] = new resources[name](this);
    }

  }

};

module.exports = Stripe;
