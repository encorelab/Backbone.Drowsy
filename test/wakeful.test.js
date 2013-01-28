// Generated by CoffeeScript 1.4.0
(function() {
  var $, Backbone, Buffer, DROWSY_URL, Drowsy, TEST_COLLECTION, TEST_DB, WAKEFUL_URL, Wakeful, btoa, _,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (typeof window !== "undefined" && window !== null) {
    $ = window.$;
    _ = window._;
    Backbone = window.Backbone;
    Drowsy = window.Drowsy;
    Wakeful = window.Wakeful;
  } else {
    $ = require('jquery');
    _ = require('underscore');
    Backbone = require('backbone');
    Backbone.$ = $;
    Drowsy = require('../backbone.drowsy').Drowsy;
    Wakeful = require('../backbone.wakeful').Wakeful;
  }

  DROWSY_URL = "http://localhost:9393/";

  WAKEFUL_URL = "ws://localhost";

  TEST_DB = 'drowsy_test';

  TEST_COLLECTION = 'tests';

  if ((typeof TEST_USERNAME !== "undefined" && TEST_USERNAME !== null) && (typeof TEST_PASSWORD !== "undefined" && TEST_PASSWORD !== null)) {
    Buffer = require('buffer').Buffer;
    btoa = function(str) {
      return (new Buffer(str || "", "ascii")).toString("base64");
    };
    Backbone.$.ajaxSetup({
      beforeSend: function(xhr) {
        return xhr.setRequestHeader('Authorization', 'Basic ' + btoa(TEST_USERNAME + ':' + TEST_PASSWORD));
      }
    });
  }

  describe('Wakeful', function() {
    return describe(".wake", function() {
      before(function() {
        this.server = new Drowsy.Server(DROWSY_URL);
        return this.db = drowsyServer.database(TEST_DB);
      });
      it('should enhance Drowsy.Document with wakeful functionality', function() {
        var TestDoc, doc;
        TestDoc = (function(_super) {

          __extends(TestDoc, _super);

          function TestDoc() {
            return TestDoc.__super__.constructor.apply(this, arguments);
          }

          return TestDoc;

        })(this.db.Document);
        doc = new TestDoc();
        Wakeful.wake(doc);
        doc.should.have.property('connect');
        doc.connect.should.be.a('function');
        doc.should.have.property('disconnect');
        return doc.disconnect.should.be.a('function');
      });
      return it('should allow the Drowsy.Document to connect to WakefulWeasel', function() {
        var TestDoc, doc;
        TestDoc = (function(_super) {

          __extends(TestDoc, _super);

          function TestDoc() {
            return TestDoc.__super__.constructor.apply(this, arguments);
          }

          return TestDoc;

        })(this.db.Document);
        doc = new TestDoc();
        Wakeful.wake(doc);
        doc.connect();
        return doc.socket.should.be.an.instanceOf(WebSocket);
      });
    });
  });

}).call(this);