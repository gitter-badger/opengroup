// @class Class
// @aka OG.Class

// @section
// @uninheritable

// Thanks to John Resig and Dean Edwards for inspiration!

OG.Class = function () {};

OG.Class.extend = function (props) {

    // @function extend(props: Object): Function
    // [Extends the current class](#class-inheritance) given the properties to be included.
    // Returns a Javascript function that is a class constructor (to be called with `new`).
    var NewClass = function () {

        // call the constructor
        if (this.initialize) {
            this.initialize.apply(this, arguments);
        }

        // call all constructor hooks
        this.callInitHooks();
    };

    var parentProto = NewClass.__super__ = this.prototype;

    var proto = OG.Util.create(parentProto);
    proto.constructor = NewClass;

    NewClass.prototype = proto;

    // inherit parent's statics
    for (var i in this) {
        if (this.hasOwnProperty(i) && i !== 'prototype') {
            NewClass[i] = this[i];
        }
    }

    // mix static properties into the class
    if (props.statics) {
        OG.extend(NewClass, props.statics);
        delete props.statics;
    }

    // mix includes into the prototype
    if (props.includes) {
        OG.Util.extend.apply(null, [proto].concat(props.includes));
        delete props.includes;
    }

    // merge options
    if (proto.options) {
        props.options = OG.Util.extend(OG.Util.create(proto.options), props.options);
    }

    // mix given properties into the prototype
    OG.extend(proto, props);

    proto._initHooks = [];

    // add method for calling all hooks
    proto.callInitHooks = function () {

        if (this._initHooksCalled) { return; }

        if (parentProto.callInitHooks && parentProto._initHooks.length) {
            parentProto.callInitHooks.call(this);
        }

        this._initHooksCalled = true;

        proto._initHooks = OG.Util.sortByKey(proto._initHooks, 'weight');

        for (var i = 0, len = proto._initHooks.length; i < len; i++) {
            proto._initHooks[i].init.call(this);
        }
    };

    return NewClass;
};


// @function include(properties: Object): this
// [Includes a mixin](#class-includes) into the current class.
OG.Class.include = function (props) {
    OG.extend(this.prototype, props);
    return this;
};

// @function mergeOptions(options: Object): this
// [Merges `options`](#class-options) into the defaults of the class.
OG.Class.mergeOptions = function (options) {
    OG.extend(this.prototype.options, options);
    return this;
};

// @function addInitHook(fn: Function): this
// Adds a [constructor hook](#class-constructor-hooks) to the class.
OG.Class.addInitHook = function (name, fn, weight) { // (Function) || (String, args...)
    var args = Array.prototype.slice.call(arguments, 1);

    var init = typeof fn === 'function' ? fn : function () {
        this[fn].apply(this, args);
    };

    this.prototype._initHooks = this.prototype._initHooks || [];
    this.prototype._initHooks.push({
        name: name,
        init: init,
        weight: weight ? weight: 0
    });
    return this;
};
