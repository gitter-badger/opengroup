/*
 * @class Group
 * @aka OG.Map
 * @inherits Evented
 *
 * The central class of the API — it is used to create an OpenGroup on a page and manipulate it.
 */

OG.ManualSignaler = OG.Signaler.extend({

});

OG.manualSignaler = function (options) {
    return new OG.ManualSignaler(options);
};