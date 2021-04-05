/*
 * decaffeinate suggestions:
 * DS101: Remove unnecessary use of Array.from
 * DS102: Remove unnecessary code created because of implicit returns
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
var Schemas;
module.exports =
    (Schemas = /** @class */ (function () {
        function Schemas() {
        }
        // Creates a new state for the current version.
        Schemas.newState = function () {
            var state = {};
            state.version = 4;
            state.bookmarks = [];
            state.servers = [];
            state.visible = false;
            state.height = 200;
            state.left = {};
            state.left.tabs = [];
            state.right = {};
            state.right.tabs = [];
            return state;
        };
        Schemas.upgrade = function (state) {
            if ((state.version === 1) || (state.version === 2)) {
                this.upgradeTo3(state);
            }
            if (state.version === 3) {
                this.upgradeTo4(state);
            }
            return state;
        };
        Schemas.upgradeTo3 = function (state) {
            state.version = 3;
            return this.upgradeServersTo3(state.servers);
        };
        Schemas.upgradeServersTo3 = function (servers) {
            var _this = this;
            if (!servers) {
                return;
            }
            return Array.from(servers).map(function (server) {
                return _this.upgradeServerTo3(server);
            });
        };
        Schemas.upgradeServerTo3 = function (server) {
            if (server.protocol !== 'sftp') {
                return;
            }
            server.privateKeyPath = '';
            server.passphrase = '';
            server.loginWithPassword = true;
            return server.usePassphrase = false;
        };
        Schemas.upgradeTo4 = function (state) {
            state.version = 4;
            return this.upgradeServersTo4(state.servers);
        };
        Schemas.upgradeServersTo4 = function (servers) {
            if (!servers) {
                return;
            }
            return Array.from(servers).map(function (server) {
                return (server.name = '');
            });
        };
        return Schemas;
    }()));
//# sourceMappingURL=schemas.js.map