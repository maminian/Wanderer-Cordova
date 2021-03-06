﻿g.services.moduleService = {
    clear: function (pageId) {
        g.services.moduleService.private.activeComponentsIds[pageId] = [];
    },
    injectComponents: function (pageId, modList, startingActiveComponentsIds) {
        g.services.moduleService.private.activeComponentsIds[pageId] = startingActiveComponentsIds;
        g.services.moduleService.private.components[pageId] = modList;
    },
    getComponent: function (pageId, compId) {
        for (var i = 0; i < g.services.moduleService.private.components[pageId].length; i++) {
            var inner = g.services.moduleService.private.components[pageId][i];
            if (compId === inner.getId()) {
                return inner.getPublic();
            }
        }
        throw { message: "could not find id: " + compId };
    },
    getActiveComponents:
        function (pageId) {
            var res = [];
            for (var i = 0; i < g.services.moduleService.private.activeComponentsIds[pageId].length; i++) {
                var lookingFor = g.services.moduleService.private.activeComponentsIds[pageId][i];
                for (var j = 0; j < g.services.moduleService.private.components[pageId].length; j++) {
                    var inner = g.services.moduleService.private.components[pageId][j];
                    if (lookingFor === inner.getId()) {
                        res.push(inner);
                    }
                }
            }
            return res;
        }, getComponents:
        function (pageId) {
            return g.services.moduleService.private.components[pageId];
        },
    getActiveComponentsIds: function (pageId) {
        return g.services.moduleService.private.activeComponentsIds[pageId];
    },
    toggle: function (pageId, module) {
        var i = g.services.moduleService.private.activeComponentsIds[pageId].indexOf(module.getId());
        if (i == -1) {
            g.services.moduleService.private.activeComponentsIds[pageId].push(module.getId());
        } else {
            g.services.moduleService.private.activeComponentsIds[pageId].splice(i, 1);
        }
    },
    activate: function (pageId, moduleId) {
        var i = g.services.moduleService.private.activeComponentsIds[pageId].indexOf(moduleId);
        if (i == -1) {
            g.services.moduleService.private.activeComponentsIds[pageId].push(moduleId);
        }
    }
};
g.services.moduleService.private = {
    activeComponentsIds: {},
    components: {}
}