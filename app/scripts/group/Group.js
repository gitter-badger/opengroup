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

    initialize: function (options) { // (HTMLElement or String, Object)
        $('body').append('<div id="opengroup"></div>');
        OG.Util.stamp(this);
        this.selector = '#opengroup';
        OG.setOptions(this, options);
    },


});
