/*
 * @class Group
 * @aka OG.Map
 * @inherits Evented
 *
 * The central class of the API — it is used to create an OpenGroup on a page and manipulate it.
 */

OG.Group = OG.Evented.extend({

    options: {
        plugins: ['core.signaler.manual'],
        renderer: {
            name: 'RivetsRenderer',
            settings: {

            }
        }
    },

    pluginDefinitions: [],

    initialize: function (id, options) { // (HTMLElement or String, Object)
        $(id).addClass('opengroup-processed')
        OG.Util.stamp(this);
        this.selector = id;
        OG.setOptions(this, options);
    },


});
