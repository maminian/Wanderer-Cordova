﻿var component = function () {
    var that = this;
    this.getId = function () {
        return "wanderer-core-save"
    }

    this.OnStart = function (communicator, dependencies) {
        this.communicator = communicator;
        this.Dependencies = dependencies;
        this.OnNewCharacter()
    }
    this.OnNewCharacter = function () {
        that.injected.nameAndKey.name = "untitled";
    }
    this.OnSave = function () {
        this.communicator.write("name", that.injected.nameAndKey.name);
    }
    this.OnLoad = function () {
        if (this.communicator.canRead("name")) {
            that.injected.nameAndKey.name = this.communicator.read("name");
        } else {
            that.injected.nameAndKey.name = "untitled";
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
        var newJson = that.injected.getJSON();
        var reallySave = function () {
            g.services.characterService.SaveCharacter(that.injected.nameAndKey.accessKey, that.injected.nameAndKey.name, angular.toJson(newJson),
                function (data) {
                    that.injected.timeout(function () {
                        that.injected.logger.info("save successful!");
                    });
                    var changed = g.services.accountService.currentAccount.addChatacterAccesser(g.models.newCharacterAccesser(that.injected.nameAndKey.accessKey, that.injected.nameAndKey.name));
                    if (changed) {
                        g.services.accountService.saveAccount(function () { }, function () {
                            throw { message: "save failed" }
                        })
                    }
                },
                function (error) {
                    that.injected.timeout(function () {
                        that.injected.logger.error("save failed " + error);
                    });
                });
        };
        g.services.characterService.GetCharacter(that.injected.nameAndKey.accessKey, function (json) {
            var ok = that.injected.compareWithLastLoaded(json);
            if (ok) {
                reallySave();
                that.injected.updateLastLoaded(newJson);
            } else {
                that.injected.timeout(function () {
                    that.injected.logger.warn("save failed, merge conflicts!");
                });
            }
        },
        function (error) {
            reallySave();
        },
        function (error) {
            that.injected.timeout(function () {
                that.injected.logger.error("error: " + error);
            });
        })
    }
}

g.services.componetService.registerCharacter(component);