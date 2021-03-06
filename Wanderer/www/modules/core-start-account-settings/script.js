﻿var ColinWielgaTemplate = {};

ColinWielgaTemplate.component = function () {
    var that = this;
    this.getId = function () {
        return "core-start-account-settings"
    }
    this.OnStart = function (communicator, logger, page, dependencies) {
        this.logger = logger;
        this.communicator = communicator;
        this.Dependencies = dependencies;
    }
    this.OnNewCharacter = function () {
    }
    this.OnSave = function () {
    }
    this.OnLoad = function () {
    }
    this.OnUpdate = function () {
    }
    this.getRequires = function () {
        return [];
    }
    this.getPublic = function () {
        return {
            getVersion: function () {
                return 1;
            }
        }
    }
    this.canClose = function () {
        return true;
    }
    this.getHmtl = function () {
        return "modules/" + this.getId() + "/page.html"
    }
    this.getRulesHtml = function () {
        return "modules/" + this.getId() + "/rules.html"
    }
    this.getTitle = function () {
        return "Account Settings";
    }
    this.getAccount = function () {
        return g.services.accountService.currentAccount;
    }
    this.save = function () {
        return g.services.accountService.saveAccount(
            function () {
                g.services.timeoutService.$timeout(function () {
                    that.logger.warn("account saved");
                });
            },
            function (err) {
                g.services.timeoutService.$timeout(function () {
                    that.logger.warn("failed to save the account:" + err);
                });
            }
        );
    }

    this.OnNewCharacter();
}

g.services.componetService.registerStart(ColinWielgaTemplate.component);