/**
 * Leaflet is used for a lot of components and ideas.
 * Great code, see leafletjs.com.
 */

var OG = {
    version: 'dev'
};

function expose() {
    var oldOG = window.OG;

    OG.noConflict = function () {
        window.OG = oldOG;
        return this;
    };

    window.OG = OG;
}

// Define OpenGroup for Node module pattern loaders, including Browserify
if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = OG;

// Define OpenGroup as an AMD module
} else if (typeof define === 'function' && define.amd) {
    define(OG);
}

// Define OpenGroup as a global OG variable, saving the original OG to restore later if needed
if (typeof window !== 'undefined') {
    expose();
}
