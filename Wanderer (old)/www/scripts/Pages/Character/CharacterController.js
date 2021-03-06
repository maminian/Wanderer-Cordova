﻿g.Character = function ($timeout, name, accessKey) {
    return new g.ModulesPage($timeout, name, accessKey, g.services.componetService.characterComponentFactories,["wanderer-core-modules","wanderer-core-save"])
}

g.StartPageController = function ($timeout, accessKey) {
    return new g.ModulesPage($timeout, "Start", accessKey, g.services.componetService.startComponentFactories, ["core-start-add-character", "core-start-recent-characters", "core-start-switch-account"])
}

g.ModulesPage = function ($timeout, name, accessKey, componentFactories, startingComponents) {
    var that = this;
    that.PageId = g.makeid();

    var comboKey = function (id, key) {
        return id + "_" + key;
    };
    var versionComboKey = function (id, key) {
        return "Version_" + id + "_" + key;
    }
    var comFactory = function (getSaveJson, id, version) {
        return {
            read: function (key) {
                return getSaveJson()[key];
            },
            canRead: function (key) {
                return getSaveJson() !== undefined && getSaveJson()[key] !== undefined;
            },
            write: function (key, value) {
                if (getSaveJson() === undefined) {
                    getSaveJson() = {};
                }
                getSaveJson()[key] = value;
            },
            lastVersion: function () {
                if (getSaveJson() === undefined) {
                    return -1;
                }
                if (getSaveJson()[g.constants.META] === undefined) {
                    return -1;
                }
                if (getSaveJson()[g.constants.META][g.constants.VERSION] === undefined) {
                    return -1;
                }
                return getSaveJson()[g.constants.META][g.constants.VERSION];
            },
            readNotCharacter: function (key) {
                return window.localStorage.getItem(comboKey(id, key));
            },
            readNotCharacterVersion: function (key) {
                return window.localStorage.getItem(versionComboKey(id, key));
            },
            canReadNotCharacter: function (key) {
                return window.localStorage.getItem(comboKey(id, key)) !== undefined;
            }, writeNotCharacter: function (key, value) {
                window.localStorage.setItem(comboKey(id, key), value);
                window.localStorage.setItem(versionComboKey(id, key), version);
            }
        };
    }
    var dataManagerFactory = function (json) {
        var res = {
            useLocal: true,
            local: json,
            remote: null,
        };
        res.current = function () {
            return res.useLocal ? res.local : res.remote;
        };
        return res;

    }
    var logFactory = function () {
        var TypeEnum = {
            VERBOSE: 1,
            DEBUG: 2,
            INFO: 3,
            WARN: 4,
            ERROR: 5,
            WTF: 6,
        }

        var displayTypeMap = {};
        displayTypeMap[TypeEnum.VERBOSE] = "Verbose";
        displayTypeMap[TypeEnum.DEBUG] = "Debug";
        displayTypeMap[TypeEnum.INFO] = "Info";
        displayTypeMap[TypeEnum.WARN] = "Warn";
        displayTypeMap[TypeEnum.ERROR] = "Error";
        displayTypeMap[TypeEnum.WTF] = "WTF";

        var logTimeout = 1000 * 20;
        var logLevel = TypeEnum.VERBOSE;

        return {
            logs: [],
            displayLogs: function () {
                var now = new Date().getTime();
                var res = [];
                this.logs.forEach(function (log) {
                    if (log.type > logLevel && now - logTimeout < log.timeStamp && !log.closed) {
                        res.push(log);
                    }
                });
                return res;
            },
            log: function (message, type) {
                this.logs.push({
                    message: message,
                    type: type,
                    displayType: displayTypeMap[type],
                    closed: false,
                    timeStamp: new Date().getTime()
                });
            },
            debug: function (message) {
                this.log(message, TypeEnum.DEBUG);
            },
            info: function (message) {
                this.log(message, TypeEnum.INFO);
            },
            warn: function (message) {
                this.log(message, TypeEnum.WARN);
            },
            error: function (message) {
                this.log(message, TypeEnum.ERROR);
            },
            wtf: function (message) {
                this.log(message, TypeEnum.WTF);
            }
        }
    }
    this.displayName = function () {
        var name = that.getName();
        if (name === null || name === undefined || name === "") {
            return "untilted";
        } else {
            return name;
        }
    };


    this.updateLastLoaded = function (json) {
        that.lastLoaded = angular.fromJson(angular.toJson(json));
    }

    this.compareWithLastLoaded = function (json) {

        for (var property in that.modMap) {
            if (that.modMap.hasOwnProperty(property)) {
                that.modMap[property].injected.dataManager.useLocal = true;
                that.modMap[property].injected.dataManager.remote = null;
            }
        }
        var toLoad = [];
        if (that.lastLoaded != null) {
            for (var property in json) {
                if (json.hasOwnProperty(property)) {
                    if (angular.toJson(json[property]) == angular.toJson(that.lastLoaded[property])) {
                    } else {
                        toLoad.push(property);
                    }
                }
            }
        }
        // we load after we finish the check incase 
        toLoad.forEach(function (property) {
            that.modMap[property].injected.dataManager.useLocal = false;
            that.modMap[property].injected.dataManager.remote = json[property];
            that.modMap[property].OnLoad();
        })

        that.updateLastLoaded(json);

        return toLoad.length == 0;
    }

    this.swap = function (module) {
        module.OnSave();
        module.injected.dataManager.useLocal = !module.injected.dataManager.useLocal;
        module.OnLoad()
    }

    // todo merge conflicts is not a good way story in injected along with some stat (which one to show)

    this.getBonus = function () {
        var res = 0;
        that.modList.forEach(function (comp) {
            var pub = comp.getPublic();
            if (pub.bonusProvided != undefined) {
                res += pub.bonusProvided();
            }
        })
        return res;
    }

    var nameAndKey = {
        name: name,
        accessKey: accessKey,
    }

    this.mintModules = function (componentFactoriesList, modMap) {
        var modList = [];

        componentFactoriesList.forEach(function (item) {
            var tem = new item();
            tem.injected = {};
            modMap[tem.getId()] = tem;
            modList.push(tem);
        });


        //var logger = modMap["wanderer-core-logger"].getPublic();
        var load = function (json) {
            nameAndKey.name = json["name"];
            nameAndKey.accessKey = json["id"];
            that.updateLastLoaded(json);
            modList.forEach(function (item) {
                item.injected.dataManager = dataManagerFactory(json[item.getId()]);
                if (item.OnLoad !== undefined) {
                    //try {
                    item.OnLoad();
                    //} catch (e) {
                    //    if (logger != undefined && logger.writeToLog != undefined) {
                    //        logger.writeToLog(e);
                    //    }
                    //}
                }
            });
        };

        // TODO this really does not belong here
        // maybe in to a service where everyone can see it
        g.services.moduleService.injectComponents(that.PageId, modList, startingComponents)

        modList.forEach(function (item) {
            // we inject a ton of stuff
            item.injected = {
                nameAndKey: nameAndKey,
                pageId: that.PageId,
                timeout: $timeout,
                load: load,
                dataManager: dataManagerFactory({}),
                logger: logFactory(),
                getJSON: function () {
                    var res = {};
                    modList.forEach(function (item) {
                        if (item.OnSave !== undefined) {
                            try {
                                item.OnSave();
                                var map = item.injected.dataManager.current();
                                if (map == undefined) {
                                    map = {};
                                }
                                if (map[g.constants.META] == undefined) {
                                    map[g.constants.META] = {};
                                }
                                map[g.constants.META][g.constants.VERSION] = item.getPublic().getVersion();
                                res[item.getId()] = map;
                            } catch (e) {
                                if (logger != undefined && logger.writeToLog != undefined) {
                                    logger.writeToLog(e);
                                }
                            }
                        }
                    });
                    return res;
                },
                getBonus: that.getBonus,
                compareWithLastLoaded: that.compareWithLastLoaded,
                updateLastLoaded: that.updateLastLoaded
            }

            if (item.OnStart !== undefined) {

                var communicator = comFactory(function () { return item.injected.dataManager.current(); }, item.getId(), item.getPublic().getVersion());

                var dependencies = [];
                if (item.getRequires !== undefined) {
                    var lookingFors = item.getRequires();
                    for (var i = 0; i < lookingFors.length; i++) {
                        var pimary = g.services.moduleService.getComponent(that.PageId,lookingFors[i])
                        if (pimary != null) {
                            dependencies.push(g.services.moduleService.getComponent(that.PageId, lookingFors[i]));
                        } else {
                            throw { message: "component: " + lookingFors[i] };
                            // is this an error case?
                        }
                    }
                }


                // we start.
                item.OnStart(communicator, dependencies);
            }
        });

        return {
            modMap: modMap,
            modList: modList,
            load: load
        };
    }


    this.getName = function () { return nameAndKey.name; };

    var mods = this.mintModules(componentFactories, {});

    this.load = mods.load;
    this.modList = mods.modList;
    this.modMap = mods.modMap;
    this.modules = function () {
        return g.services.moduleService.getActiveComponents(that.PageId)
    };
    this.Remove = function (module) {
        g.services.moduleService.toggle(that.PageId, module);
    };
}