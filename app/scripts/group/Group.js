/*
 * @class Group
 * @aka OG.Map
 * @inherits Evented
 *
 * The central class of the API — it is used to create an OpenGroup on a page and manipulate it.
 */

OG.Group = OG.Evented.extend({

    options: {
        plugins: ['core.signaler.manual']
    },

    pluginDefinitions: [],

    initialize: function (id, options) { // (HTMLElement or String, Object)
        OG.setOptions(this, options);
        this.callInitHooks();
    },


});

OG.group = function (id, options) {
    return new OG.Group(id, options);
};