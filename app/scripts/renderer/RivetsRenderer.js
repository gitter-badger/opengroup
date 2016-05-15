OG.RivetsRenderer = OG.Renderer.extend({

    options: {
    },

    // TODO do we need this kind of freedom to select where to add the html?
    render: function (templateName, templateOwner, data, callback, selector, method) {
        if (!data) { data = []; }
        if (!method) { method = 'append' }
        if (!selector) { selector = this.group.selector }

        this._getTemplate(templateName, templateOwner, function (template) {
            var templateDom = OG.Util.$(template);
            OG.Util.$(selector)[method](templateDom);
            rivets.bind(templateDom, data);

            if (typeof callback == 'function') {
                callback();
            }
        });
    },
    getPropertyByDotNotation: function (obj, desc) {
        var arr = desc.split(".");
        while (arr.length && (obj = obj[arr.shift()]));
        return obj;
    }

});

OG.RivetsRenderer.addInitHook('RivetsRenderer', function () {
    var that = this;

    rivets.configure({
        prefix: 'bind',
        templateDelimiters: ['{{', '}}']
    });

    // Original: https://github.com/der-On/rivets-include.
    rivets.binders.include = {
        bind: function(el) {
            var self = this;

            this.clear = function() {
                if (this.nested) {
                    this.nested.unbind();
                }

                el.innerHTML = '';
            };

            this.load = function(el, templateName, templateOwner) {
                this.clear();

                that._getTemplate(templateName, templateOwner, function (template) {
                    include(template);
                });

                function include(html) {
                    // copy models into new view
                    var models = {};
                    Object.keys(self.view.models).forEach(function(key) {
                        models[key] = self.view.models[key];
                    });

                    el.innerHTML = html;

                    var options = {};
                    if (typeof self.view['options'] === 'function') {
                        options = self.view.options();
                    }
                    var els = Array.prototype.slice.call(el.childNodes);
                    self.nested = rivets.bind(els, models, options);

                    // dispatch include event
                    var event = new CustomEvent('include', {
                        detail: {
                            templateName: templateName,
                            templateOwner: templateOwner
                        },
                        bubbles: true,
                        cancelable: true
                    });

                    el.dispatchEvent(event);
                }
            };
        },
        unbind: function(el) {
            if (this.clear) this.clear();
        },
        routine: function(el, value) {
            var self = this;
            var templateInfo = this.keypath.split('/');
            var templateOwner = templateInfo[0];
            var templateName = templateInfo[1];

            var removeTemplateDelimiters = function (string) {
                self.view.templateDelimiters.forEach(function (templateDelimiter) {
                    string = string.replace(templateDelimiter, '');
                });
                return string.trim();
            };

            var templateOwnerCleaned = removeTemplateDelimiters(templateOwner);
            if (templateOwner = that.getPropertyByDotNotation(this.view.models, templateOwnerCleaned))

            var templateNameCleaned = removeTemplateDelimiters(templateName);
            if (templateName = that.getPropertyByDotNotation(this.view.models, templateNameCleaned))

            if (templateName && templateOwner) {
                this.load(el, templateName, templateOwner);
            }
        }
    };
});