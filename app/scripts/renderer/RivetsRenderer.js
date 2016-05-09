OG.RivetsRenderer = OG.Renderer.extend({

    options: {
    },

});

OG.RivetsRenderer.addInitHook('RivetsRenderer', function () {
    rivets.configure({
        prefix: 'bind',
        templateDelimiters: ['{{', '}}']
    });
});