/*
 * @class Group
 * @aka OG.Map
 * @inherits Evented
 *
 * The central class of the API — it is used to create an OpenGroup on a page and manipulate it.
 */

OG.Signaler = OG.Evented.extend({

    options: {

    },

    initialize: function (options) { // (Object)
        OG.setOptions(this, options);
        this.callInitHooks();
    },



});

OG.signaler = function (options) {
    return new OG.Signaler(options);
};