﻿var component = function () {
    var that = this;
    this.getId = function () {
        return "wanderer-core-save"
    }

    this.OnStart = function (communicator, logger, page, dependencies) {
        this.logger = logger;
        this.page = page;
        this.communicator = communicator;
        this.Dependencies = dependencies;
        this.OnNewCharacter()
    }
    this.OnNewCharacter = function () {
        that.page.name = "untitled";
    }
    this.OnSave = function () {
        this.communicator.write("name", that.page.name);
    }
    this.OnLoad = function () {
        if (this.communicator.canRead("name")) {
            that.page.name = this.communicator.read("name");
        } else {
            that.page.name = "untitled";
        }
    }
    this.getRequires = function () {
        return [];
    }
    this.getPublic = function () {
        var that = this;
        return {
            getVersion: function () {
                return 1;
            },
            injectComponents: function (comps) {
                that.components = comps;
            }
        }
    }
    this.getHmtl = function () {
        return "modules/" + this.getId() + "/page.html"
    }
    this.getRulesHtml = function () {
        return "modules/" + this.getId() + "/rules.html"
    }
    this.canClose = function () {
        return true;
    }
    this.getTitle = function () {
        return "Save";
    }
    this.save = function () {
        var newJson = that.page.getJSON();
        var reallySave = function () {
            g.services.characterService.SaveCharacter(that.page.accessKey, that.page.name, angular.toJson(newJson),
                function (data) {
                    g.services.timeoutService.$timeout(function () {
                        that.logger.info("save successful!");
                    });
                    var changed = g.services.accountService.currentAccount.addChatacterAccesser(g.models.newCharacterAccesser(that.page.accessKey, that.page.name));
                    if (changed) {
                        g.services.accountService.saveAccount(function () { }, function () {
                            throw { message: "save failed" }
                        })
                    }
                },
                function (error) {
                    g.services.timeoutService.$timeout(function () {
                        that.logger.error("save failed " + error);
                    });
                });
        };
        g.services.characterService.GetCharacter(that.page.accessKey, function (json) {
            var ok = that.page.compareWithLastLoaded(json);
            if (ok) {
                reallySave();
                that.page.updateLastLoaded(newJson);
            } else {
                g.services.timeoutService.$timeout(function () {
                    that.logger.warn("save failed, merge conflicts!");
                });
            }
        },
        function (error) {
            reallySave();
        },
        function (error) {
            g.services.timeoutService.$timeout(function () {
                that.logger.error("error: " + error);
            });
        })
    }
}

g.services.componetService.registerCharacter(component);