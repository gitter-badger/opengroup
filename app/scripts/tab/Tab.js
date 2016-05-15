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

    addTo: function (group) {
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
            this._oneTabHasBeenClicked = false;
            this.render('tabs', 'core', this);
             tab.active = true;
        }

        this.tabs.push(tab);

        this.tabs.sort(function (a, b) {
            return a.options.weight - b.options.weight;
        });

        // Plugins may load async, so the first loaded plugins is not always the first one.
        if (!this.tabs[0].active && !this._oneTabHasBeenClicked) {
            this.setActiveTab(this.tabs[0].name);
        }
    },

    setActiveTab: function (tabName) {
        var that = this;
        that._oneTabHasBeenClicked = true;

        that.tabs.forEach(function (tab) {
            tab.active = tab.name == tabName;
        });
    }
});