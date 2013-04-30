// Generated by CoffeeScript 1.4.0
(function() {
  var $, Backbone, Drowsy, crypto, os, root, _,
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  if (typeof window !== "undefined" && window !== null) {
    $ = window.$;
    _ = window._;
    Backbone = window.Backbone;
    Backbone.ajax = $.ajax;
  } else {
    $ = require('jquery');
    _ = require('underscore');
    Backbone = require('backbone');
    Backbone.$ = $;
    crypto = require('crypto');
    os = require('os');
  }

  Drowsy = (function() {

    function Drowsy() {}

    Drowsy.generateMongoObjectId = function() {
      return (new Drowsy.ObjectId()).toString();
    };

    return Drowsy;

  })();

  Drowsy.Server = (function() {

    function Server(url, options) {
      if (options == null) {
        options = {};
      }
      this.createDatabase = __bind(this.createDatabase, this);

      this.databases = __bind(this.databases, this);

      this.database = __bind(this.database, this);

      if (typeof url === 'object') {
        options = url;
      } else if (typeof url === 'string') {
        options.url = url;
      }
      this.options = options;
    }

    Server.prototype.url = function() {
      return this.options.url.replace(/\/$/, '');
    };

    Server.prototype.database = function(dbName) {
      return new Drowsy.Database(this, dbName);
    };

    Server.prototype.databases = function(after) {
      var deferredFetch,
        _this = this;
      deferredFetch = $.Deferred();
      Backbone.ajax({
        url: this.url(),
        dataType: 'json',
        success: function(data) {
          var dbName, dbs, _i, _len;
          dbs = [];
          for (_i = 0, _len = data.length; _i < _len; _i++) {
            dbName = data[_i];
            if (dbName.match(Drowsy.Database.VALID_DB_RX)) {
              dbs.push(_this.database(dbName));
            }
          }
          deferredFetch.resolve(dbs);
          if (after != null) {
            return after(dbs);
          }
        },
        error: function(xhr, status) {
          return deferredFetch.reject(status, xhr);
        }
      });
      return deferredFetch;
    };

    Server.prototype.createDatabase = function(dbName, after) {
      var deferredCreate,
        _this = this;
      deferredCreate = $.Deferred();
      Backbone.ajax({
        url: this.url(),
        type: 'POST',
        data: {
          db: dbName
        }
      }).done(function(data, status, xhr) {
        if (status === 'success') {
          deferredCreate.resolve('already_exists', xhr);
          if (after != null) {
            return after('already_exists');
          }
        } else {
          deferredCreate.resolve(status, xhr);
          if (after != null) {
            return after(status);
          }
        }
      }).fail(function(xhr, status) {
        if (xhr.status === 0 && xhr.responseText === "") {
          deferredCreate.resolve('cors_mystery');
        }
        deferredCreate.reject(xhr);
        if (after != null) {
          return after('failed');
        }
      });
      return deferredCreate;
    };

    return Server;

  })();

  Drowsy.Database = (function() {

    Database.VALID_DB_RX = /[^\s\.\$\/\\\*]+/;

    function Database(server, dbName, options) {
      if (options == null) {
        options = {};
      }
      this.Collection = __bind(this.Collection, this);

      this.Document = __bind(this.Document, this);

      this.createCollection = __bind(this.createCollection, this);

      this.collections = __bind(this.collections, this);

      if (typeof server === 'string') {
        server = new Drowsy.Server(server);
      }
      this.server = server;
      this.name = dbName;
      this.options = options;
      this.url = server.url() + '/' + dbName;
    }

    Database.prototype.collections = function(after) {
      var deferredFetch,
        _this = this;
      deferredFetch = $.Deferred();
      Backbone.ajax({
        url: this.url,
        dataType: 'json'
      }).done(function(data, status, xhr) {
        var c, collName, colls, _i, _len;
        colls = [];
        for (_i = 0, _len = data.length; _i < _len; _i++) {
          collName = data[_i];
          c = new ((function(_super) {

            __extends(_Class, _super);

            function _Class() {
              return _Class.__super__.constructor.apply(this, arguments);
            }

            return _Class;

          })(_this.Collection(collName)));
          colls.push(c);
        }
        deferredFetch.resolve(colls);
        if (after != null) {
          return after(colls);
        }
      }).fail(function(xhr, status) {
        deferredFetch.reject(xhr);
        if (after != null) {
          return after('failed');
        }
      });
      return deferredFetch;
    };

    Database.prototype.createCollection = function(collectionName, after) {
      var deferredCreate,
        _this = this;
      deferredCreate = $.Deferred();
      Backbone.ajax({
        url: this.url,
        type: 'POST',
        data: {
          collection: collectionName
        }
      }).done(function(data, status, xhr) {
        if (status === 'success') {
          deferredCreate.resolve('already_exists', xhr);
          if (after != null) {
            return after('already_exists');
          }
        } else {
          deferredCreate.resolve(status, xhr);
          if (after != null) {
            return after(status);
          }
        }
      }).fail(function(xhr, status) {
        deferredCreate.reject(xhr);
        if (after != null) {
          return after('failed');
        }
      });
      return deferredCreate;
    };

    Database.prototype.Document = function(collectionName) {
      var db;
      db = this;
      return (function(_super) {

        __extends(_Class, _super);

        function _Class() {
          return _Class.__super__.constructor.apply(this, arguments);
        }

        _Class.prototype.urlRoot = db.url + '/' + collectionName;

        _Class.prototype.collectionName = collectionName;

        return _Class;

      })(Drowsy.Document);
    };

    Database.prototype.Collection = function(collectionName) {
      var db;
      db = this;
      return (function(_super) {

        __extends(_Class, _super);

        function _Class() {
          return _Class.__super__.constructor.apply(this, arguments);
        }

        _Class.prototype.url = db.url + '/' + collectionName;

        _Class.prototype.name = collectionName;

        return _Class;

      })(Drowsy.Collection);
    };

    return Database;

  })();

  Drowsy.Collection = (function(_super) {

    __extends(Collection, _super);

    function Collection() {
      return Collection.__super__.constructor.apply(this, arguments);
    }

    Collection.prototype.model = Drowsy.Document;

    return Collection;

  })(Backbone.Collection);

  Drowsy.Document = (function(_super) {

    __extends(Document, _super);

    function Document() {
      return Document.__super__.constructor.apply(this, arguments);
    }

    Document.prototype.idAttribute = '_id';

    Document.prototype.initialize = function() {
      if (!this.has(this.idAttribute)) {
        return this.set(this.idAttribute, Drowsy.generateMongoObjectId());
      }
    };

    Document.prototype.set = function(key, val, options) {
      var res, _ref;
      res = Document.__super__.set.call(this, key, val, options);
      if ((_ref = this.dirty) == null) {
        this.dirty = {};
      }
      _.extend(this.dirty, this.changedAttributes());
      return res;
    };

    Document.prototype.sync = function(method, model, options) {
      var res;
      res = Document.__super__.sync.call(this, method, model, options);
      this.dirty = {};
      return res;
    };

    Document.prototype.reset = function() {
      var res;
      res = Document.__super__.reset.call(this);
      this.dirty = {};
      return res;
    };

    Document.prototype.fetch = function(options) {
      var originalSuccess, res,
        _this = this;
      if (options == null) {
        options = {};
      }
      originalSuccess = options.success;
      options.success = function(doc, data, xhr) {
        if (originalSuccess != null) {
          originalSuccess(doc, data, xhr);
        }
        return _this.dirty = {};
      };
      res = Document.__super__.fetch.call(this, options);
      return res;
    };

    Document.prototype.dirtyAttributes = function() {
      return this.dirty;
    };

    Document.prototype.parse = function(data) {
      var parsed, _ref;
      data._id = (_ref = data._id.$oid) != null ? _ref : data._id;
      parsed = this.parseObjectRecursively(data, this.jsonToDate);
      return parsed;
    };

    Document.prototype.toJSON = function(options) {
      var data, parsed;
      if (options == null) {
        options = {};
      }
      data = Document.__super__.toJSON.call(this, options);
      parsed = this.parseObjectRecursively(data, this.dateToJson);
      return parsed;
    };

    /* 
    private
    */


    Document.prototype.parseObjectRecursively = function(obj, parser) {
      var i, item, key, out, val, _i, _len;
      if (obj === null) {
        return null;
      }
      out = parser(obj);
      if (_.isArray(out)) {
        for (i = _i = 0, _len = out.length; _i < _len; i = ++_i) {
          item = out[i];
          out[i] = this.parseObjectRecursively(out[i], parser);
        }
      } else if (_.isObject(out) && Object.keys(out).length > 0) {
        for (key in out) {
          val = out[key];
          out[key] = this.parseObjectRecursively(val, parser);
        }
      }
      return out;
    };

    Document.prototype.jsonToDate = function(val) {
      var date;
      if ((val != null) && (val.$date != null)) {
        date = new Date(val.$date);
        if (isNaN(date.getTime())) {
          val.$invalid = true;
          return val;
        } else {
          return date;
        }
      } else {
        return val;
      }
    };

    Document.prototype.dateToJson = function(val) {
      if (val instanceof Date) {
        return {
          "$date": val.toJSON()
        };
      } else {
        return val;
      }
    };

    return Document;

  })(Backbone.Model);

  /*
  Javascript class that mimics how WCF serializes a object of type MongoDB.Bson.ObjectId
  and converts between that format and the standard 24 character representation.
  
  TODO: move this stuff out into its own module...
  */


  Drowsy.ObjectId = (function() {

    ObjectId.increment = 0;

    function ObjectId(oid, machine, pid, incr) {
      var cookie, cookieList, i, mongoMachineId;
      pid = pid != null ? pid : Math.floor(Math.random() * 32767.);
      machine = machine != null ? machine : Math.floor(Math.random() * 16777216.);
      if (typeof document !== "undefined" && document !== null) {
        if (typeof localStorage !== "undefined" && localStorage !== null) {
          mongoMachineId = parseInt(localStorage["mongoMachineId"]);
          if (mongoMachineId >= 0 && mongoMachineId <= 16777215) {
            machine = Math.floor(localStorage["mongoMachineId"]);
          }
          localStorage["mongoMachineId"] = machine;
          document.cookie = "mongoMachineId=" + machine + ";expires=Tue, 19 Jan 2038 05:00:00 GMT";
        } else {
          cookieList = document.cookie.split("; ");
          for (i in cookieList) {
            cookie = cookieList[i].split("=");
            if (cookie[0] === "mongoMachineId" && cookie[1] >= 0 && cookie[1] <= 16777215) {
              machine = cookie[1];
              break;
            }
          }
          document.cookie = "mongoMachineId=" + machine + ";expires=Tue, 19 Jan 2038 05:00:00 GMT";
        }
      } else {
        mongoMachineId = crypto.createHash('md5').update(os.hostname()).digest('binary');
      }
      if (typeof oid === "object") {
        this.timestamp = oid.timestamp;
        this.machine = oid.machine;
        this.pid = oid.pid;
        this.increment = oid.increment;
      } else if (typeof oid === "string" && oid.length === 24) {
        this.timestamp = Number("0x" + oid.substr(0, 8));
        this.machine = Number("0x" + oid.substr(8, 6));
        this.pid = Number("0x" + oid.substr(14, 4));
        this.increment = Number("0x" + oid.substr(18, 6));
      } else if ((oid != null) && (machine != null) && (pid != null) && (incr != null)) {
        this.timestamp = oid;
        this.machine = machine;
        this.pid = pid;
        this.increment = incr;
      } else {
        this.timestamp = Math.floor(new Date().valueOf() / 1000);
        this.machine = machine;
        this.pid = pid;
        if (Drowsy.ObjectId.increment > 0xffffff) {
          Drowsy.ObjectId.increment = 0;
        }
        this.increment = Drowsy.ObjectId.increment++;
      }
    }

    ObjectId.prototype.getDate = function() {
      return new Date(this.timestamp * 1000);
    };

    /*
        Turns a WCF representation of a BSON ObjectId into a 24 character string representation.
    */


    ObjectId.prototype.toString = function() {
      var increment, machine, pid, timestamp;
      timestamp = this.timestamp.toString(16);
      machine = this.machine.toString(16);
      pid = this.pid.toString(16);
      increment = this.increment.toString(16);
      return "00000000".substr(0, 6 - timestamp.length) + timestamp + "000000".substr(0, 6 - machine.length) + machine + "0000".substr(0, 4 - pid.length) + pid + "000000".substr(0, 6 - increment.length) + increment;
    };

    return ObjectId;

  })();

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.Drowsy = Drowsy;

}).call(this);
