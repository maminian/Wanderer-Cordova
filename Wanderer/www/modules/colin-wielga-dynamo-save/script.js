﻿ColinWielgaDyanmo.States = {
    WORKING: "WORKING",
    LIST: "LIST",
    NEW: "NEW",
    ENTER_GAME: "ENTER_GAME",
    JSON: "JSON",
}

ColinWielgaDyanmo.Providers = {
    AWS: "AWS",
    LOCAL: "LOCAL"
}

ColinWielgaDyanmo.component = function () {
    var that = this;
    this.isWorking = function () {
        return that.state == ColinWielgaDyanmo.States.WORKING;
    }
    this.isList = function () {
        return that.state == ColinWielgaDyanmo.States.LIST;
    }
    this.isNew = function () {
        return that.state == ColinWielgaDyanmo.States.NEW;
    }
    this.isEnterGame = function () {
        return that.state == ColinWielgaDyanmo.States.ENTER_GAME;
    }
    this.isJSON = function () {
        return that.state == ColinWielgaDyanmo.States.JSON;
    }
    

    this.goToNew = function () {
        that.state = ColinWielgaDyanmo.States.NEW;
    }
    this.goToJSON = function () {
        that.state = ColinWielgaDyanmo.States.JSON;

    }
    this.goToEnterGame = function () {
        that.state = ColinWielgaDyanmo.States.ENTER_GAME;

    }
    this.goToList = function () {
        that.state = ColinWielgaDyanmo.States.LIST;
    }

    // all component need a unique ID
    this.getId = function () {
        return "colin-wielga-dynamo-save"
    }


    this.OnStart = function (communicator, dependencies) {
        this.communicator = communicator
        this.default();
        if (this.communicator.canReadNotCharacter("gameName")) {
            this.gameName = this.communicator.readNotCharacter("gameName");
        }
        if (this.communicator.canReadNotCharacter("gamePassword")) {
            this.gamePassword = this.communicator.readNotCharacter("gamePassword");
        }
        if (this.communicator.canReadNotCharacter("name")) {
            this.name = this.communicator.readNotCharacter("name");
        }
        if (this.communicator.canReadNotCharacter("provider")) {
            this.provider = this.communicator.readNotCharacter("provider") == ColinWielgaDyanmo.Providers.LOCAL ? ColinWielgaDyanmo.localProvider : ColinWielgaDyanmo.awsProvider;
        }


    }
    this.default = function () {
        this.gameName = "";
        this.gamePassword = "";
        this.list = [];
        this.state = ColinWielgaDyanmo.States.ENTER_GAME;
        this.provider = ColinWielgaDyanmo.awsProvider;
        this.name = ""
    }

    this.OnNewCharacter = function () {

    }
    this.OnSave = function () {
        this.communicator.write("gameName", this.gameName);
        this.communicator.write("gamePassword", this.gamePassword);
        this.communicator.write("name", this.name);
        this.communicator.write("provider", ColinWielgaDyanmo.localProvider ? ColinWielgaDyanmo.Providers.LOCAL : ColinWielgaDyanmo.Providers.AWS);
        this.communicator.writeNotCharacter("gameName", this.gameName);
        this.communicator.writeNotCharacter("gamePassword", this.gamePassword);
        this.communicator.writeNotCharacter("name", this.name);
        this.communicator.writeNotCharacter("provider", ColinWielgaDyanmo.localProvider ?ColinWielgaDyanmo.Providers.LOCAL : ColinWielgaDyanmo.Providers.AWS);
    }
    this.OnLoad = function () {
        this.OnNewCharacter();
        if (this.communicator.canRead("gameName")) {
            this.gameName = this.communicator.read("gameName");
        } 
        if (this.communicator.canRead("gamePassword")) {
            this.gamePassword = this.communicator.read("gamePassword");
        }
        if (this.communicator.canRead("name")) {
            this.name = this.communicator.read("name");
        }
        if (this.communicator.canRead("state")) {
            this.state = this.communicator.read("state");
        }
        if (this.communicator.canRead("provider")) {
            this.provider = this.communicator.read("provider") == ColinWielgaDyanmo.Providers.LOCAL ? ColinWielgaDyanmo.localProvider : ColinWielgaDyanmo.awsProvider;
        }
        //if (this.state === ColinWielgaDyanmo.States.WORKING) {
        //    this.state = ColinWielgaDyanmo.States.ENTER_GAME;
        //    this.connect();
        //} else if (this.state === ColinWielgaDyanmo.States.LIST) {
        //    this.connect();
         if (this.state !== ColinWielgaDyanmo.States.JSON) {
            var that = this;
            that.provider.getCharacters(this.gameName, this.gamePassword,
                function (list) {
                    that.injected.timeout(function () {
                        that.list = list;
                        that.state = ColinWielgaDyanmo.States.NEW;
                    });
                }, function () {
                    that.injected.timeout(function () { that.state = ColinWielgaDyanmo.States.ENTER_GAME; })
                }, function () {
                    that.injected.timeout(function () { that.state = ColinWielgaDyanmo.States.ENTER_GAME; })
                });
        }
    }
    this.OnUpdate = function () { }
    this.getRequires = function () {
        return [];
    }

    this.OnUpdate = function () {
    }

    this.getPublic = function () {
        var that = this;
        return {
            getVersion: function () {
                return 1;
            },
            getName:function () {
                return that.name;
            },
            loadLastCharacter: function () {
                
                that.state = ColinWielgaDyanmo.States.WORKING;
                if (that.name != null && that.name != undefined && that.gameName != null && that.gameName != undefined && that.gamePassword != null && that.gamePassword != undefined) {
                    ColinWielgaDyanmo.GetCharacter(that.name, that.gameName, that.gamePassword,
                    function (data) {
                        that.injected.load(JSON.parse(data.Item.JSON.S), that.name);
                        that.injected.timeout(function () {
                            that.state = ColinWielgaDyanmo.States.NEW;
                        })
                    }, function () {
                        that.injected.timeout(function () {
                            this.state = ColinWielgaDyanmo.States.ENTER_GAME;
                        });
                    }, function () {
                        that.injected.timeout(function () {
                            this.state = ColinWielgaDyanmo.States.ENTER_GAME;
                        });
                    })
                } else {
                    this.state = ColinWielgaDyanmo.States.ENTER_GAME;
            }
        }
    }
    }

    // a component should be able to provide some infomation
    this.getHmtl = function () {
        return "modules/" + this.getId() + "/page.html"
    }

    this.getRulesHtml = function () {
        return "modules/" + this.getId() + "/rules.html"
    }

    this.getTitle = function () {
        return "AWS storage";
    }
    this.saveJson = function () {
        this.injected.load(JSON.parse(this.json));
    }
    this.refreshJSON = function () {
        this.json = JSON.stringify(this.injected.getJSON());
    }
    this.connectCommon = function () {
        var that = this;
        that.provider.getCharacters(this.gameName, this.gamePassword,
            function (list) {
                that.injected.timeout(function () {
                    that.list = list
                    that.state = ColinWielgaDyanmo.States.LIST;
                });
            }, function () {

            }, function () {

            })
    }
    this.load = function (name) {
        var that = this;
        that.state = ColinWielgaDyanmo.States.WORKING;
        that.provider.GetCharacter(name, this.gameName, this.gamePassword,
            function (json) {
                that.injected.load(json);
                that.injected.timeout(function () {
                    that.state = ColinWielgaDyanmo.States.NEW;
                    that.name = name;
                })
            }, function () {

            }, function () {

            })
    }
    this.save = function () {
        var that = this;
        that.state = ColinWielgaDyanmo.States.WORKING;
        that.provider.SaveCharacter(this.name, this.gameName, this.gamePassword, JSON.stringify(that.injected.getJSON()),
            function (data) {
                //actuly if it works it does nothing
                that.injected.timeout(function () {
                    that.state = ColinWielgaDyanmo.States.NEW;
                })
            },
            function () {

            }, function () {

            })
    }
    this.Local = function () {
        this.provider = ColinWielgaDyanmo.localProvider;
        this.connectCommon();
    }
    this.connect = function () {
        this.provider = ColinWielgaDyanmo.awsProvider;
        this.connectCommon();
    }
}

g.ComponetRegistry.register(ColinWielgaDyanmo.component);