AVE.Modules['AccountSwitcher'] = {
    ID: 'AccountSwitcher',
    Name: 'Account Switcher',
    Desc: 'Store information for several accounts and switch between them easily.',
    Category: 'Account',

    Index: 100,
    Enabled: false,

    Store: {},

    RunAt: "ready",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: false
        }
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    SetOptionsFromPref: function () {
        var _this = this;
        var Opt = this.Store.GetValue(this.Store.Prefix + this.ID, "{}");

        $.each(JSON.parse(Opt), function (key, value) {
            _this.Options[key].Value = value;
        });
        this.Enabled = this.Options.Enabled.Value;
    },

    Load: function () {
        this.Store = AVE.Storage;
        this.SetOptionsFromPref();

        if (this.Enabled) {

            this.StorageName = this.Store.Prefix + this.ID + "_accounts";

            this.savedAccounts = JSON.parse(this.Store.GetValue(this.StorageName, "[]"));

            this.Start();
        }
    },

    Start: function () {
        //Thanks a lot to /u/GingerSoul for this feature!

        this.style = '' +
            'span#AVE_AccountSwitcher_del {\
                /* Delete */\
                height: 14px;\
                width: 14px;\
                margin-top:2px;\
                margin-left:4px;\
                /* SVG from Jquery Mobile Icon Set */\
                background-image:url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpolygon%20fill%3D%22%23' + (AVE.Utils.CSSstyle === "dark" ? "af3f3f" : "ce6d6d") + '%22%20points%3D%2214%2C3%2011%2C0%207%2C4%203%2C0%200%2C3%204%2C7%200%2C11%203%2C14%207%2C10%2011%2C14%2014%2C11%2010%2C7%20%22%2F%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3C%2Fsvg%3E")!important;\
    background-repeat: no-repeat;\
    cursor: pointer;\
    background-position: center;\
                }\
            span#AVE_AccountSwitcher_edit {\
                /* edit */\
                height: 14px;\
                width: 14px;\
                margin-top:2px;\
                margin-left:4px;\
                /* SVG from Jquery Mobile Icon Set */\
                background-image:url("data:image/svg+xml;charset=US-ASCII,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22iso-8859-1%22%3F%3E%3C!DOCTYPE%20svg%20PUBLIC%20%22-%2F%2FW3C%2F%2FDTD%20SVG%201.1%2F%2FEN%22%20%22http%3A%2F%2Fwww.w3.org%2FGraphics%2FSVG%2F1.1%2FDTD%2Fsvg11.dtd%22%3E%3Csvg%20version%3D%221.1%22%20id%3D%22Layer_1%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Axlink%3D%22http%3A%2F%2Fwww.w3.org%2F1999%2Fxlink%22%20x%3D%220px%22%20y%3D%220px%22%20%20width%3D%2214px%22%20height%3D%2214px%22%20viewBox%3D%220%200%2014%2014%22%20style%3D%22enable-background%3Anew%200%200%2014%2014%3B%22%20xml%3Aspace%3D%22preserve%22%3E%3Cpath%20fill%3D%22%23377da8%22%20d%3D%22M1%2C10l-1%2C4l4-1l7-7L8%2C3L1%2C10z%20M11%2C0L9%2C2l3%2C3l2-2L11%2C0z%22%2F%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3Cg%3E%3C%2Fg%3E%3C%2Fsvg%3E")!important;\
        background-repeat: no-repeat;\
        cursor: pointer;\
        background-position: center;\
                }';

        AVE.Utils.AddStyle(this.style);
        this.AppendToPage();
        this.Listeners();
    },

    storageName: "",
    style: "",
    savedAccounts: [],
    hoverColour: "#e23f3f",
    normalColour: "#000",

    AppendToPage: function () { //To insert content into the page
        var _this = this;

        var q = $('div#header-account > div:first'),
            qH = q.get(0).offsetHeight,
            qW = q.get(0).offsetWidth;
        if (q.length > 0) {
            var light = AVE.Utils.CSSstyle === "light";
            if (!light)
            { this.normalColour = '#fff';
              this.hovercolour = "#8c2f2f"}
            var manager = document.createElement('span');
            manager.style.position = 'relative';
            manager.style.display = 'inline-block';
            manager.style.visibility = 'visible';
            manager.style.fontSize = '12px';
            var managerIcon = document.createElement('img');
            manager.appendChild(managerIcon);
            managerIcon.src = '/favicon.ico';
            managerIcon.width = (qH / 2) > 13 ? qH / 2 : 13;
            managerIcon.height = (qH / 2) > 13 ? qH / 2 : 13;
            managerIcon.title = 'Accounts';
            managerIcon.style.cursor = 'pointer';
            managerIcon.style.marginRight = '0.5em';
            var managerMenu = document.createElement('div');
            manager.appendChild(managerMenu);
            managerMenu.style.display = 'none';
            managerMenu.style.position = 'absolute';
            managerMenu.style.left = '0';
            managerMenu.style.top = (qH / 1.5) + 'px';
            managerMenu.style.width = (qW >= 200 ? 200 : qW) + 'px';
            managerMenu.style.border = '1px solid #777';
            managerMenu.style.borderRadius = '3px';
            managerMenu.style.background = light ? '#fff' : '#333';
            managerMenu.style.color = this.normalColour;
            managerMenu.style.textAlign = 'left';
            managerIcon.addEventListener('click', function (e) {
                managerMenu.style.display = managerMenu.style.display == 'none' ? 'block' : 'none';
            }, false);
            document.addEventListener('click', function (e) {
                if (e.target != managerIcon)
                    managerMenu.style.display = 'none';
            }, false);
            $.each(this.savedAccounts, function (val) {
                print('AVE: AccountSwitcher > adding ' + _this.savedAccounts[val].name, true);
                _this.addLoginLink(managerMenu, _this.savedAccounts[val].name, _this.savedAccounts[val].pass);
            });
            var managerAddAccount = document.createElement('div');
            managerAddAccount.appendChild(document.createTextNode('+ Add account'));
            managerMenu.appendChild(managerAddAccount);
            managerAddAccount.style.cursor = 'pointer';
            managerAddAccount.style.padding = '0 0.5em';
            this.switchColor(managerAddAccount);
            managerAddAccount.addEventListener('click', function () {
                var user = prompt('Username', '');
                if (!user){
                    return false;
                }
                var exit = false;
                $.each(_this.savedAccounts, function (idx) {
                    if (user.toUpperCase() === _this.savedAccounts[idx].name.toUpperCase()) {
                        alert('User ('+user+') already exists');
                        exit = true;
                        return false;
                    }
                });
                if (exit){return false;}

                var pass = prompt('Password', '');
                if (!pass){
                    alert("You need to input a password");
                    return false;
                }
                _this.savedAccounts.push({
                    name: user,
                    pass: pass
                });
                _this.Store.SetValue(_this.StorageName, JSON.stringify(_this.savedAccounts));
                managerMenu.removeChild(managerAddAccount);
                _this.addLoginLink(managerMenu, user, pass);
                managerMenu.appendChild(managerAddAccount);
            }, false);
            if (q.className === 'logged-in'){
                q = q.find(".user");
            }
            $(manager).insertBefore(q.find('>:first-child'));
        }
    },

    switchColor: function (e) {
        var _this = this;
        $(e).hover(function() {
            $(this).css( "color", _this.hoverColour );
        },         function() {
            $(this).css( "color", _this.normalColour );
        });
    },

    logIn: function (user, pass) {
        var token = document.querySelector('[name="__RequestVerificationToken"]');
        if (!token) {
            alert('Can\'t login from this page');
            return;
        }
        var form = document.createElement('form');
        var userInput = document.createElement('input');
        var passInput = document.createElement('input');
        var tokenInput = document.createElement('input');
        var rememberMe = document.createElement('input');
        form.method = 'post';
        form.action = '/account/login?ReturnUrl=' + encodeURIComponent(location.pathname);
        form.appendChild(userInput);
        form.appendChild(passInput);
        form.appendChild(tokenInput);
        form.appendChild(rememberMe);
        document.body.appendChild(form);
        userInput.name = 'UserName';
        userInput.value = user;
        passInput.name = 'Password';
        passInput.value = pass;
        tokenInput.name = '__RequestVerificationToken';
        tokenInput.value = token.value;
        rememberMe.type = 'checkbox';
        rememberMe.value = 'RememberMe';
        rememberMe.value = 'false';
        form.style.display = 'none';
        form.submit();
    },

    addLoginLink: function (managerMenu, name) {
        if (typeof name !== "string") {print("AVE: AccountSwitcher > wrong variable type for \"name\""); return false;}
        var _this = this;
        var account = document.createElement('div'),
            namelink = document.createElement('span');

        namelink.appendChild(document.createTextNode(name));
        account.appendChild(namelink);

        var del = $('<span id="AVE_AccountSwitcher_del" style="float:right;" title="remove account information"></span>').get(0),
            edit = $('<span id="AVE_AccountSwitcher_edit" style="float:right;" title="change password"></span>').get(0);

        account.appendChild(del);
        account.appendChild(edit);
        managerMenu.appendChild(account);
        account.style.cursor = 'pointer';
        account.style.padding = '0 0.5em';

        this.switchColor(account);

        $(edit).off()
            .on("click", function () {
                var pass = prompt('New password', '');
                if (pass) {
                    for (var i = 0; i < _this.savedAccounts.length; i++) {
                        if (name.toUpperCase() === _this.savedAccounts[i].name.toUpperCase()) {
                            _this.savedAccounts[i].pass = pass;
                            break;
                        }
                    }
                    _this.Store.SetValue(_this.StorageName, JSON.stringify(_this.savedAccounts));
                }
        });
        $(del).off()
            .on("click", function () {
                if (confirm('Are you sure you want to remove '+name+' ?')) {
                    for (var i = 0; i < _this.savedAccounts.length; i++) {
                        if (name.toUpperCase() === _this.savedAccounts[i].name.toUpperCase()) {
                            _this.savedAccounts.splice(i, 1);
                            break;
                        }
                    }
                    _this.Store.SetValue(_this.StorageName, JSON.stringify(_this.savedAccounts));
                    managerMenu.removeChild(account);
                }
            });

        $(namelink).off()
            .on("click", function () {
                for (var i = 0; i < _this.savedAccounts.length; i++) {
                    if (name.toUpperCase() === _this.savedAccounts[i].name.toUpperCase()){
                        _this.logIn(name, _this.savedAccounts[i].pass);
                        return false;
                    }
                }
            });
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            //var _this = AVE.Modules['AccountSwitcher'];

            return 'Feature written by <a href="https://voat.co/u/GingerSoul">/u/GingerSoul</a>.<br><br>' +
                    '<strong>DO NOT FORGET that your account information are stored unencrypted in AVE\'s data when you export it to a JSON file!</strong>';
        }
    }
};