OG.Tab = OG.Evented.extend({

    options: {
        owner: 'core',
        template: 'tab'
    },

    initialize: function (group, options) { // (Object)
        this.group = group;
        OG.setOptions(this, options);
    },

    render: function () {
        OG.Util.stamp(this);
        this.group.render(this.options.template, this.options.owner, this, function () {

        });
    },

    _addTo: function (group) {
        group._addTab(this);
    }

});

OG.Group.include({
    _addTab: function (tab) {
        if (!this.tabs) {
            this.tabs = [];
        }

        this.tabs.push(tab);
        tab.render();
    }
});