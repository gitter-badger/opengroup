OpenGroupPlugins["opengroup.groupchat"] = {
    recieveMessage: function (message, openGroup, senderPeerId) {
        console.log(message)
    },
    hooks: {
        init: function () {
        }
    }
};