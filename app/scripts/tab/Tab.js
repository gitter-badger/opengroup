OG.Tab = OG.Evented.extend({

    options: {
        templates: {
            tab: 'tab',
            icon: 'icon'
        }
    },

    active: false,

    initialize: function (group, options) {
        OG.Util.stamp(this);
        this.group = group;
        OG.setOptions(this, options);
    },

    _addTo: function (group) {
        group.addTab(this);
    },

    tabClick: function (event, model) {
        model.setActiveTab(model.tab.name);
    }
});

OG.Group.include({
    addTab: function (tab) {
        if (!this.tabs) {
            this.tabs = [];

            this.render('tabs', 'core', this);
            tab.active = true;
        }

        this.tabs.push(tab);
    },

    setActiveTab: function (tabName) {
        var that = this;

        that.tabs.forEach(function (tab) {
            tab.active = tab.name == tabName;
        });
    }
});