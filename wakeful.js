// Generated by CoffeeScript 1.4.0
(function() {
  var $, Backbone, Drowsy, Wakeful, WebSocket, callOrRead, root, _;

  if (typeof window !== "undefined" && window !== null) {
    $ = window.$;
    _ = window._;
    Backbone = window.Backbone;
    Drowsy = window.Drowsy;
    WebSocket = window.WebSocket;
  } else {
    $ = require('jquery');
    _ = require('underscore');
    Backbone = require('backbone');
    Backbone.$ = $;
    Drowsy = require('./backbone.drowsy').Drowsy;
    WebSocket = require('ws');
  }

  callOrRead = function(val, context) {
    if (_.isFunction(val)) {
      return val.call(context);
    } else {
      return val;
    }
  };

  Wakeful = (function() {

    function Wakeful() {}

    Wakeful.sync = function(method, obj, options) {
      var deferredSync;
      deferredSync = $.Deferred();
      Backbone.sync(method, obj, options).done(function() {
        var data;
        data = obj.toJSON();
        if (method === 'create' || method === 'update' || method === 'patch') {
          obj.broadcast(method, data, options.origin || obj.wid || obj.defaultWid());
        }
        return deferredSync.resolve();
      });
      return deferredSync;
    };

    Wakeful.wake = function(obj, wakefulUrl) {
      if (wakefulUrl == null) {
        throw new Error("Must provide a wakefulUrl");
      }
      obj.broadcastEchoQueue = [];
      return _.extend(obj, {
        sync: Wakeful.sync,
        defaultWid: function() {
          return callOrRead(this.url, this) + '#' + this.cid;
        },
        connect: function() {
          var ackHandler, baseRx, broadcastHandler, deferredConnection, fullRx,
            _this = this;
          baseRx = "^wss?://[^/]+";
          fullRx = "" + baseRx + "/\\w+/\\w+(/[0-9a-f]+)?";
          if (wakefulUrl.match(new RegExp("" + baseRx + "/?$"))) {
            this.socketUrl = callOrRead(this.url, this).replace(new RegExp("[a-z]+://[^/]+/?"), wakefulUrl + "/");
          } else if (wakefulUrl.match(new RegExp(fullRx))) {
            this.socketUrl = wakefulUrl;
          } else {
            console.error(wakefulUrl, "is not a valid WakefulWeasel WebSocket URL!");
            throw "Invalid WakefulWeasel WebSocket URL!";
          }
          deferredConnection = $.Deferred();
          if ((this.socket != null) && this.socket.URL === this.socketUrl) {
            this.socket.connect();
            return this.socket;
          }
          this.socket = new WebSocket(this.socketUrl);
          broadcastHandler = function(ev) {
            var broadcastData, echoIndex, echoOf, json, _ref;
            json = ev.data;
            broadcastData = JSON.parse(json);
            _this.trigger('wakeful:broadcast:received', obj, broadcastData);
            echoOf = _.find(_this.broadcastEchoQueue, function(b) {
              return b.bid === broadcastData.bid;
            });
            if (echoOf != null) {
              echoIndex = _.indexOf(_this.broadcastEchoQueue, echoOf);
              _this.broadcastEchoQueue.splice(echoIndex, 1);
              echoOf.resolve();
            }
            if ((_ref = broadcastData.action) === 'update' || _ref === 'patch' || _ref === 'create') {
              return _this.set(broadcastData.data);
            } else {
              return console.warn("Don't know how to handle broadcast with action", broadcastData.action);
            }
          };
          ackHandler = function(ev) {
            var ackData, err, json;
            json = ev.data;
            ackData = JSON.parse(json);
            if (ackData.status === 'SUCCESS') {
              _this.socket.onmessage = broadcastHandler;
              _this.trigger('wakeful:subscribed', obj, ev);
              return deferredConnection.resolve();
            } else {
              err = "Subscription to " + _this.socketUrl + " failed";
              console.error(err);
              return deferredConnection.reject(err);
            }
          };
          this.socket.onopen = function(ev) {
            console.log("Wakeful WebSocket open for", callOrRead(_this.url, _this));
            _this.trigger('wakeful:open', obj, ev);
            return _this.socket.onmessage = ackHandler;
          };
          this.socket.onclose = function(ev) {
            console.warn("Wakeful WebSocket closed for", callOrRead(_this.url, _this));
            return _this.trigger('wakeful:disconnected', obj, ev);
          };
          this.socket.error = function(ev) {
            console.error("Wakeful WebSocket error for", callOrRead(_this.url, _this));
            return _this.trigger('wakeful:error', obj, ev);
          };
          return deferredConnection;
        },
        disconnect: function() {
          if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            return this.socket.close;
          }
        },
        broadcast: function(action, data, origin) {
          var bid, deferredBroadcast, send,
            _this = this;
          if (origin == null) {
            origin = this.wid;
          }
          deferredBroadcast = $.Deferred();
          bid = Drowsy.generateMongoObjectId().toString();
          send = function() {
            var broadcastData;
            broadcastData = {
              action: action,
              data: data,
              bid: bid
            };
            if (origin != null) {
              broadcastData.origin = origin;
            }
            deferredBroadcast.bid = bid;
            _this.broadcastEchoQueue.push(deferredBroadcast);
            _this.socket.send(JSON.stringify(broadcastData));
            _this.trigger('wakeful:broadcast:sent', obj, broadcastData);
            return deferredBroadcast.notify('sent');
          };
          switch (this.socket.readyState) {
            case WebSocket.OPEN:
              send();
              break;
            case WebSocket.CONNECTING:
              this.socket.onopen = send;
              break;
            case WebSocket.CLOSED:
            case WebSocket.CLOSING:
              console.warn("WebSocket(" + this.socket.URL + ") is closing or closed... Cannot broadcast!");
              break;
            default:
              console.error("WebSocket(" + this.socket.URL + ") is in a weird state... Cannot broadcast!", this.socket.readyState);
          }
          return deferredBroadcast;
        }
      });
    };

    return Wakeful;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.Wakeful = Wakeful;

}).call(this);
