var Renderer = function () {
    var that = this;
    this.templates = {};
    this.render = function (templateName, data, method, selector) {
        if (!data) { data = []; }
        if (!method) { method = 'append' }
        if (!selector) { selector = 'body' }

        this.getTemplate(templateName, function (template) {
            var templateDom = $(template);
            $(selector)[method](templateDom);
            rivets.bind(templateDom, data);
        });
    };

    this.getTemplate = function (templateName, callback) {
        if (!this.templates[templateName]) {
            $.get('/templates/' + templateName + '.html', function (data) {
                that.templates[templateName] = data;
                callback(that.templates[templateName]);
            });
        }
        else {
            callback(this.templates[templateName]);
        }
    };
};