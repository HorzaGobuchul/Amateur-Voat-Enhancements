AVE.Modules['AccountSwitcher'] = {
    ID: 'AccountSwitcher',
    Name: 'Account Switcher',
    Desc: 'Store information for several accounts and switch between them quickly.',
    Category: 'Account',

    Index: 100,
    Enabled: false,

    Store: {},

    RunAt: "ready",

    Options: {
        Enabled: {
            Type: 'boolean',
            Value: true,
        },
        Accounts: {
            Type: 'array',
            Desc: 'Stored account information',
            Value: []

        }
    },

    OriginalOptions: "",

    SavePref: function (POST) {
        var _this = this;
        POST = POST[this.ID];

        this.Store.SetValue(this.Store.Prefix + this.ID, JSON.stringify(POST));
    },

    ResetPref: function () {// will add the reset option in the pref manager. Can be deleted.
        var _this = this;
        this.Options = JSON.parse(this.OriginalOptions);
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
        this.OriginalOptions = JSON.stringify(this.Options); //If ResetPref is used
        this.SetOptionsFromPref();

        if (this.Enabled) {
            this.Start();
        }
    },

    Start: function () {
        //Thanks a lot to /u/GingerSoul for this feature!
        this.AppendToPage();
        this.Listeners();
    },

    AppendToPage: function () { //To insert content into the page
    },

    Listeners: function () { //To bind event listeners to the content added in AppendToPage.
    },

    AppendToPreferenceManager: { //Use to add custom input to the pref Manager
        html: function () {
            var _this = AVE.Modules['AccountSwitcher'];
            var htmlStr = '';

            //Show all account name. Opt.
            //  Delete, Change psw, Change name
            //  Button to display psw for all pairs
            return htmlStr;
        },
        callback: function () {
        },
    },
};
/*
    // ==UserScript==
    // @name        Voat User Manager
    // @namespace   https://voat.co/
    // @description Manager all your alts ;-)
    // @include     https://voat.co/*
    // @include     https://www.voat.co/*
    // @version     1
    // @run-at      document-end
    // @grant       GM_getValue
    // @grant       GM_setValue
    // @grant       GM_deleteValue
    // ==/UserScript==

    var color1 = "#f00", color2 = "#000";

    function switchColor(e, color1, color2) {
        e.addEventListener("mouseover", function(e){e.target.style.color=color1;}, false);
        e.addEventListener("mouseout", function(e){e.target.style.color=color2;}, false);
    }

    function logIn(user, pass) {
        var token = document.querySelector('[name="__RequestVerificationToken"]');
        if(!token) {
            alert("Can't login from this page");
            return;
        }
        var form = document.createElement("form");
        var userInput = document.createElement("input");
        var passInput = document.createElement("input");
        var tokenInput = document.createElement("input");
        var rememberMe = document.createElement("input");
        form.method = "post";
        form.action = "/account/login?ReturnUrl=" + encodeURIComponent(location.pathname);
        form.appendChild(userInput);
        form.appendChild(passInput);
        form.appendChild(tokenInput);
        form.appendChild(rememberMe);
        userInput.name = "UserName";
        userInput.value = user;
        passInput.name = "Password";
        passInput.value = pass;
        tokenInput.name = "__RequestVerificationToken";
        tokenInput.value = token.value;
        rememberMe.type = "checkbox";
        rememberMe.value = "RememberMe";
        rememberMe.value = "false";
        form.style.display = "none";
        form.submit();
    }

    function addLoginLink(managerMenu, name) {
        var account = document.createElement("div");
        account.appendChild(document.createTextNode(name));
        managerMenu.appendChild(account);
        account.style.cursor = "pointer";
        account.style.padding = "0 0.5em";
        switchColor(account, color1, color2);
        account.addEventListener("click", function(e) {
            var savedAccounts = JSON.parse(GM_getValue("savedAccounts", "[]"));
            if(e.shiftKey) {
                var pass = prompt("New password", "");
                if(pass) {
                    for(var i = 0; i < savedAccounts.length; i++) {
                        if(name.toUpperCase() === savedAccounts[i].name.toUpperCase()) {
                            savedAccounts[i].pass = pass;
                            break;
                        }
                    }
                    GM_setValue("savedAccounts", JSON.stringify(savedAccounts));
                }
            } else if(e.ctrlKey) {
                if(confirm("Delete saved account?")) {
                    for(var i = 0; i < savedAccounts.length; i++) {
                        if(name.toUpperCase() === savedAccounts[i].name.toUpperCase()) {
                            savedAccounts.splice(i, 1);
                            break;
                        }
                    }
                    GM_setValue("savedAccounts", JSON.stringify(savedAccounts));
                    managerMenu.removeChild(account);
                }
            } else {
                for(var i = 0; i < savedAccounts.length; i++) {
                    if(name.toUpperCase() === savedAccounts[i].name.toUpperCase())
                        logIn(name, savedAccounts[i].pass);
                }
            }
        }, false);
    }

    var q = document.querySelector("#header-account > div");
    if(q) {
        var light = document.cookie.match(/theme=dark;/) ? false : true;
        if(!light)
            color2 = "#fff";

        var manager = document.createElement("span");
        manager.style.position = "relative";
        manager.style.display = "inline-block";
        manager.style.visibility = "visible";
        manager.style.fontSize = "12px";

        var managerIcon = document.createElement("img");
        manager.appendChild(managerIcon);
        managerIcon.src = "/favicon.ico";
        managerIcon.width = (q.offsetHeight / 2) > 15 ? q.offsetHeight / 2 : 15;
        managerIcon.height = (q.offsetHeight / 2) > 15 ? q.offsetHeight / 2 : 15;
        managerIcon.title = "Accounts";
        managerIcon.style.cursor = "pointer";
        managerIcon.style.marginRight = "0.5em";

        var managerMenu = document.createElement("div");
        manager.appendChild(managerMenu);
        managerMenu.style.display = "none";
        managerMenu.style.position = "absolute";
        managerMenu.style.left = "0";
        managerMenu.style.top = (q.offsetHeight / 1.5) + "px";
        managerMenu.style.width = q.offsetWidth + "px";
        managerMenu.style.border = "1px solid #777";
        managerMenu.style.borderRadius = "3px";
        managerMenu.style.background = light ? "#fff" : "#333";
        managerMenu.style.color = color2;
        managerMenu.style.textAlign = "left";
        managerIcon.addEventListener("click", function(e) {
            managerMenu.style.display = managerMenu.style.display == "none" ? "block" : "none";
        }, false);
        document.addEventListener("click", function(e) {
            if(e.target != managerIcon)
                managerMenu.style.display = "none";
        }, false);

        var savedAccounts = JSON.parse(GM_getValue("savedAccounts", "[]"));
        for(var i = 0; i < savedAccounts.length; i++) {
            addLoginLink(managerMenu, savedAccounts[i].name, savedAccounts[i].pass);
        }

        var managerAddAccount = document.createElement("div");
        managerAddAccount.appendChild(document.createTextNode("+ Add account"));
        managerMenu.appendChild(managerAddAccount);
        managerAddAccount.style.cursor = "pointer";
        managerAddAccount.style.padding = "0 0.5em";
        switchColor(managerAddAccount, color1, color2);
        managerAddAccount.addEventListener("click", function() {
            var user = prompt("Username", "");
            if(!user)
                return;
            for(var i = 0; i < savedAccounts.length; i++) {
                if(user.toUpperCase() === savedAccounts[i].name.toUpperCase()) {
                    alert("User already exists");
                    return;
                }
            }
            var pass = prompt("Password", "");
            if(!pass)
                return;
            savedAccounts.push({name:user,pass:pass});
            GM_setValue("savedAccounts", JSON.stringify(savedAccounts));
            managerMenu.removeChild(managerAddAccount);
            addLoginLink(managerMenu, user, pass);
            managerMenu.appendChild(managerAddAccount);
        }, false);

        if(q.className === "logged-in")
            q = q.querySelector(".user");
        q.insertBefore(manager, q.querySelector(":first-child"));
    }



*/