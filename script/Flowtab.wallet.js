Flowtab.wallet = (function () {

    // Define variables

    var STRIPE_PUBLISHABLE_KEY = 'pk_0DqYGS5XKylBAqcUtb5PetXFkvKQk'
      , self = { view: {} }
      , view = self.view
      , framework = Flowtab.framework
      , currentUser = null
      , currentView = null
      , venues = null
      , menu = null
      , categories = null
      , products = null
      , product = null
      , pageHeight = null
      , windowHeight = null
      , hasLoadedUser = false
      , hasLoadedDocument = false
      , hasLoadedVenues = false
      , hasLoadedMenu = false
      , jQT = new Zepto.jQTouch({});

    // Check if DOM loaded and if user is logged-in

    function initialize() {
        if (!hasLoadedDocument || !hasLoadedUser) {
            return;
        }
        hideSpinner();
        if (currentUser === null) {
            showView(view.welcome, 'slidedown');
        } else {
            self.showVenuesView("slideleft");
        }
    }

    function removeViewBindings(viewStore) {

        for (var k in viewStore)
            if (k.charAt(0) === '$')
                viewStore[k].unbind();
    }

    function removeTopbarBindings() {
        $("#topbar-left-nav,#topbar-right-nav").unbind();
    }

    // Check if product list or category list

    function buildMenu(data, parent) {
        if (!data)
            return console.log(parent,'null data');

        var i = data.length - 1
          , o;

        for (; i !== -1; --i) {
            o = data[i];

            if (!parent || parent.categories || parent.products)
                categories[o.id] = o;
            else
                products[o.id] = o;

            if (o.categories)
                buildMenu(o.categories, o);
            else if (o.products)
                buildMenu(o.products, o);
        }
    }

    function showView(view, method) {
/*
        if (currentView === view) {
            console.warn('Flowtab.wallet.showView::view_already_shown_warning (view.id:' + view.id + ', ...)');
            return;
        }
*/
        currentView = view;
        console.info('Flowtab.wallet.showView::showView (view.id:' + view.id + ', ...)');
        jQT.goTo(view.$container, method);
    }

    function showSignUpFailureMessage(error) {
        // body...
    }

    function hideSignUpFailureMessage() {
        // body...
    }

    function showSignUpSuccessMessage() {
        // body...
    }

    function hideSignUpSuccessMessage() {
        // body...
    }

    function showSignInFailureMessage(error) {
        // body...
    }

    function hideSignInFailureMessage() {
        // body...
    }

    function showSaveCreditCardFailureMessage() {
        // body...
    }

    function hideSaveCreditCardFailureMessage() {
        // body...
    }

    // Spinner functions

    function showSpinner() {
        $("#spinner-wrap").show();
    }

    function hideSpinner() {
        $("#spinner-wrap").hide();
    }

    // Topbar functions

    function showTopbar() {
        $("#topbar").addClass("topbar-visible");
    }

    function hideTopbar() {
        $("#topbar").removeClass("topbar-visible");
    }

    function showCheckout() {
        $(".bottombar").addClass("bottombar-visible");
    }

    function hideCheckout() {
        $(".bottombar").removeClass("bottombar-visible");
    }

    function showError() {
        hideSpinner();
        //write error message to currentView
    }

    // Detect height to fix scrolling errors

    function detectHeight() {
        pageHeight = $(".current").height();
        deviceHeight = $(window).height();
        if (pageHeight > deviceHeight ) {
            alert("Scroll");
        } else {
            alert("Not Scroll");
        }
    }

    // Prevent non-numeric values on certain fields

    function numericOnly() {
        $(".numeric").keydown(function(event) {
            if(event.shiftKey) {
                event.preventDefault();
            }
            if (event.keyCode == 46 || event.keyCode == 8) {
                return;
            } else {
                if (event.keyCode < 95) {
                    if (event.keyCode < 48 || event.keyCode > 57) {
                        event.preventDefault();
                    }
                } else {
                    if (event.keyCode < 96 || event.keyCode > 105) {
                        event.preventDefault();
                    }
                }
            }
        });
    }

    // Build title and buttons of topbar

    function buildTopBar(title, nav1, nav2) {
        $("#topbar-title").html(title);
        $("#topbar-left-nav,#topbar-right-nav").removeClass();
        $("#topbar-left-nav").addClass(nav1);
        $("#topbar-right-nav").addClass(nav2);
        showTopbar();
    }

    // Load data for views

    self.loadVenues = function Flowtab_wallet_loadVenues() {
        if (currentView === view.venues)
            showSpinner();

        framework.service.getVenues(function (data) {
            venues = data.venues;
            hasLoadedVenues = true;
            hasLoadedMenu = false;
            menu = null;
            categories = null;
            products = null;

            self.buildVenuesView(venues);

            if (currentView === view.venues)
                hideSpinner();
        });
    };

    self.loadMenu = function Flowtab_wallet_loadMenu(venueId) {
        if (currentView.id.indexOf('categories') === 0)
            showSpinner();

        framework.service.getMenu(venueId, function (data) {
            hasLoadedMenu = true;
            menu = data.menu;
            categories = {};
            //products = {};

            buildMenu(data.menu);
            self.buildCategoriesView(menu, view.categories1, view.categories2);

            if (currentView.id.indexOf('categories') === 0)
                hideSpinner();
        });
    };

    // Build views using Swig

    self.buildWelcomeView = function Flowtab_wallet_buildWelcomeView() {
        var $container = view.welcome.$container
          , $signUpButton = $container.find('#signup-btn')
          , $signInButton = $container.find('#signin-btn')

        removeViewBindings(view.welcome);

        $.extend(view.welcome, {
            $signUpButton: $signUpButton
          , $signInButton: $signInButton
        });

        $signUpButton.bind('click', function () {
            buildTopBar('Sign Up','welcome','');
            showView(view.signUp, 'slideup');
            numericOnly();
        });

        $signInButton.bind('click', function () {
            buildTopBar('Login','welcome','');
            showView(view.signIn, 'slideup');
            numericOnly();
        });
    };

    self.buildSignUpView = function Flowtab_wallet_buildSignUpView() {
        var $container = view.signUp.$container
          , $template = view.signUp.$template
          , $closeButton = $("#topbar .welcome")
          , $form = $container.find('form')
          , $signUpButton = $form.find('button[type="submit"]');

        removeViewBindings(view.signUp);

        $.extend(view.signUp, {
            $closeButton: $closeButton
          , $form: $form
          , $submitButton: $signUpButton
        });

        $form.bind('submit', function () {
            showSpinner();

            var formEntries = $form.serializeArray()
              , i = formEntries.length
              , data = {};
/*
            if (i > 0)
                for (; i !== -1; --i)
                    data[formEntries[i].name] = formEntries[i].value;
*/
            framework.service.createUser(data.firstName, data.lastName, data.phoneNumber, data.password, data.emailAddress, function (data) {
                hideSpinner();

                if (data.error) {
                    showSignUpFailureMessage(data.error);

                    return;
                }

                currentUser = data.user;

                showSignUpSuccessMessage();

                setTimeout(function () {
                    hideSignUpSuccessMessage();
                    buildTopBar('Save Card','','');
                    showView(view.saveCreditCard, 'slideleft');
                }, 2400);
            });

            return false;
        });

        $closeButton.bind('click', function () {
            $("#topbar-left-nav,#topbar-right-nav").removeClass();
            showView(view.welcome, 'slidedown');
            hideTopbar();
            return false;
        });
    };

    self.buildSignInView = function Flowtab_wallet_buildSignInView() {
        var $container = view.signIn.$container
          , $closeButton = $("#topbar .welcome")
          , $form = $container.find('form')
          , $submitButton = $form.find('button[type="submit"]')
          , $passwordResetButton = $form.find('.password-reset-button');

        removeViewBindings(view.signIn);

        $.extend(view.signIn, {
            $closeButton: $closeButton
          , $form: $form
          , $submitButton: $submitButton
          , $passwordResetButton: $passwordResetButton
        });

        $form.bind('submit', function () {
            showSpinner();

            var formEntries = $form.serializeArray()
              , i = formEntries.length
              , data = {};
/*
            if (i > 0)
                for (; i !== -1; --i)
                    data[formEntries[i].name] = formEntries[i].value;
*/
            framework.service.authenticateUser(data.phoneNumber, data.password, function (data) {
                hideSpinner();

                if (data.error) {
                    showSignInFailureMessage(data.error);

                    return;
                }

                currentUser = data.user;

                if (currentUser.creditCard === null) {
                    buildTopBar('Save Card','','');
                    showView(view.Venues, 'slideleft');
                } else {
                    self.showVenuesView();
                }     
            });
            return false;
        });

        $closeButton.bind('click', function () {
            $("#topbar-left-nav,#topbar-right-nav").removeClass();
            showView(view.welcome, 'slidedown');
            hideTopbar();
            return false;
        });

        $passwordResetButton.bind('click', function () {
            showView(view.passwordReset, 'slideleft');
            return false;
        });
    };

    self.buildSaveCreditCardView = function Flowtab_wallet_buildSaveCreditCardView() {
        var $container = view.saveCreditCard.$container;

        removeViewBindings(view.saveCreditCard);
        
        $container.html(view.saveCreditCard.render({ user: currentUser }));

        var $form = $container.find('form')
          , $submitButton = $form.find('button[type="submit"]')

        $.extend(view.saveCreditCard, {
            $form: $form
          , $submitButton: $submitButton
        });

        $form.bind('submit', function () {
            showSpinner();

            var formEntries = $form.serializeArray()
              , i = formEntries.length
              , data = {};

/*
            if (i > 0)
                for (; i !== -1; --i)
                    data[formEntries[i].name] = formEntries[i].value;
*/

            //NOTE: fake data
            data.number = '4111111111111111';
            data.expirationMonth = '5';
            data.expirationYear = '2015';
            data.code = '123';

            Stripe.createToken({
                    number: data.number
                  , exp_month: data.expirationMonth
                  , exp_year: data.expirationYear
                  , cvc: data.code
                }
              , function (status, data) {
                    if (data.error) {
                        hideSpinner();
                        showSaveCreditCardFailureMessage(data.error);

                        return;
                    }
                    
                    framework.service.saveUserCreditCard(data.id, function (data) {
                        hideSpinner();

                        if (data.error) {
                            showSaveCreditCardFailureMessage(data.error);

                            return;
                        }

                        currentUser.creditCard = data.creditCard;

                        $form.get(0).reset();
                        self.showVenuesView();
                    });
                }
            );

            return false;
        });
    };

    self.buildVenuesView = function Flowtab_wallet_buildVenuesView(items) {
        var $container = view.venues.$container;

        removeViewBindings(view.venues);
        
        $container.html(view.venues.render({ items: items }));

        var $items = $container.find('.venue');

        $.extend(view.venues, {
            $items: $items
        });

        $items.bind('click', function () {
            buildTopBar('Venue Name','back','');
            self.showCategoriesView(1, 'slideleft');
            self.loadMenu(this.id);
            showCheckout();
        });
    };

    self.buildCategoriesView = function Flowtab_wallet_buildCategoriesView(items, targetView, nextView) {
        var $container = targetView.$container;

        removeViewBindings(targetView);
        $container.html(view.categories1.render({ items: items }));

        var $items = $container.find('.category');

        $.extend(targetView, {
            $items: $items
        });

        $items.bind('click', function () {
            var item = categories[this.id];

            if (item.categories) {
                self.buildCategoriesView(item.categories, nextView, targetView);
                showView(nextView, 'slideleft');
            }
            else if (item.products) {
                self.buildProductsView(item.products);
                buildTopBar(this.id,'back','');
                showView(view.products, 'slideleft');
            }
            else {
                console.error('Flowtab.wallet.buildCategoriesView::empty_category_error (item:' +  JSON.stringfy(item) + ')');
            }
        });
    };

    self.buildProductsView = function Flowtab_wallet_buildProductsView(products) {
        var $container = view.products.$container;

        removeViewBindings(view.products);
        $container.html(view.products.render({ items: products }));

        var $items = $container.find('.product');

        $items.bind('click', function () {
            self.buildProductView(this.id);
            showView(view.product, 'slideleft');
        });

    };

    self.buildProductView = function Flowtab_wallet_buildProductView(product) {
        var $container = view.product.$container;

        removeViewBindings(view.product);
        $container.html(view.product.render({ items: product }));
    };

    self.buildCheckoutView = function Flowtab_wallet_buildCheckoutView() {
        var cart = {
            products: {
                '90114057-09ff-4099-bdbd-a252af3ee6a1': {
                    id: '90114057-09ff-4099-bdbd-a252af3ee6a1'
                  , name: 'Stella Artois'
                  , category: {
                        id: 'f33627aa-5544-4e52-ba7f-dc8c2fa1a4d8'
                      , name: 'Regular Beer'
                      , kind: 'Beer'
                      , description: '...'
                    }
                  , price: 7.0
                  , description: 'psuedo-fancy'
                }
              , 'a449ad0b-8f00-4cee-b03c-762b3234ac56': {
                    id: 'a449ad0b-8f00-4cee-b03c-762b3234ac56'
                  , name: 'Crabbys'
                  , category: {
                        id: 'af3ac88e-c673-481e-8191-af3b3f15c0f8'
                      , name: 'American Beer'
                      , kind: 'Beer'
                      , description: '...'
                    }
                  , price: 10.5
                  , description: 'super-fancy'
                }
              , '83ebbec5-f6da-4549-924d-e81702e3a310': {
                    id: '83ebbec5-f6da-4549-924d-e81702e3a310'
                  , name: 'Crabbys'
                  , category: {
                        id: 'af3ac88e-c673-481e-8191-af3b3f15c0f8'
                      , name: 'America Beer'
                      , kind: 'Beer'
                      , description: '...'
                    }
                  , price: 5.0
                  , description: 'super-weak'
                }
            }
          , total: 22.5
        };
    };

    self.buildConfirmationView = function Flowtab_wallet_buildConfirmationView() {
        // body...
    };

    self.buildConfigurationView = function Flowtab_wallet_buildConfigurationView() {
        // body...
    };

    self.buildSettingsView = function Flowtab_wallet_buildSettingsView() {
        var $container = view.settings.$container;

        removeViewBindings(view.settings);

        $("#settings-cards").bind('click', function () {
            self.showSaveCreditCardView("slideleft");
        });

        $("#settings-account").bind('click', function () {
            self.showAccountView("slideleft");
        });

        $("#settings-rewards").bind('click', function () {
            self.showRewardsView("slideleft");
        });

        $("#settings-works").bind('click', function () {
            self.showWorksView("slideleft");
        });

        $("#settings-security").bind('click', function () {
            self.showSecurityView("slideleft");
        });

        $("#settings-share").bind('click', function () {
            self.showShareView("slideleft");
        });

        $("#settings-feedback").bind('click', function () {
            self.showFeedbackView("slideleft");
        });

    };

    // Show views after they're built

    self.showVenuesView = function Flowtab_wallet_showVenuesView(transition) {  
        buildTopBar("Locations", "settings", "");
        showView(view.venues, transition);

        $("#topbar-left-nav").unbind();
        $("#topbar-left-nav").bind("click", function () {
            self.buildSettingsView();
            self.showSettingsView("flipleft");
        });

        if (!hasLoadedVenues)
            showSpinner();
        else if (venues === null)
            showError();
    }

    self.showSettingsView = function Flowtab_wallet_showSettingsView(transition) {
        buildTopBar("Settings", "x-arrow", "");
        showView(view.settings, transition);

        $("#topbar-left-nav").unbind();
        $("#topbar-left-nav").bind("click", function () {
            self.showVenuesView("flipleft");
        });

        if (!hasLoadedVenues)
            showSpinner();
        else if (venues === null)
            showError();
    }

    self.showCategoriesView = function Flowtab_wallet_showCategoriesView(id, transition) {
        buildTopBar("New Albany", "back", "");
        showView(view['categories' + id], transition);

        $("#topbar-left-nav").unbind();
        if (id === 1) {
            $("#topbar-left-nav").bind("click", function () {
                self.showVenuesView("slideright");
            });
        } else {
            $("#topbar-left-nav").bind("click", function () {
                self.showCategoriesView("slideright");
            });
        }
        if (!hasLoadedMenu)
            showSpinner();
        else if (menu === null)
            showError();
    }

    self.showSaveCreditCardView = function Flowtab_wallet_showSaveCreditCardView(transition) {
        buildTopBar("Cards", "back", "");
        showView(view.saveCreditCard, transition);
        removeTopbarBindings();
        $("#topbar-left-nav").bind("click", function () {
            self.showSettingsView("slideright");
        });
    };

    self.showAccountView = function Flowtab_wallet_showAccountView(transition) {
        buildTopBar("Account", "back", "");
        showView(view.account, transition);
        removeTopbarBindings();
        $("#topbar-left-nav").bind("click", function () {
            self.showSettingsView("slideright");
        });
    };

    self.showRewardsView = function Flowtab_wallet_showRewardsView(transition) {
        buildTopBar("Rewards", "back", "");
        showView(view.rewards, transition);
        removeTopbarBindings();
        $("#topbar-left-nav").bind("click", function () {
            self.showSettingsView("slideright");
        });
    };

    self.showWorksView = function Flowtab_wallet_showWorksView(transition) {
        buildTopBar("Works", "back", "");
        showView(view.works, transition);
        removeTopbarBindings();
        $("#topbar-left-nav").bind("click", function () {
            self.showSettingsView("slideright");
        });
    };

    self.showSecurityView = function Flowtab_wallet_showSecurityView(transition) {
        buildTopBar("Security", "back", "");
        showView(view.security, transition);
        removeTopbarBindings();
        $("#topbar-left-nav").bind("click", function () {
            self.showSettingsView("slideright");
        });
    };

    self.showShareView = function Flowtab_wallet_showShareView(transition) {
        buildTopBar("Share", "back", "");
        showView(view.share, transition);
        removeTopbarBindings();
        $("#topbar-left-nav").bind("click", function () {
            self.showSettingsView("slideright");
        });
    };

    self.showFeedbackView = function Flowtab_wallet_showFeedbackView(transition) {
        buildTopBar("Feedback", "back", "");
        showView(view.feedback, transition);
        removeTopbarBindings();
        $("#topbar-left-nav").bind("click", function () {
            self.showSettingsView("slideright");
        });
    };

    // Not sure what this is doing

    $('.view').each(function () {
        var id = this.id
          , s = ''
          , t = id.split('-')
          , n = t.length - 1
          , tn
          , templateElement = document.getElementById(id + '-template');
        if (n > 0) {
            for (; n !== 0; --n) {
                tn = t[n];
                t[n] = tn.charAt(0).toUpperCase() + tn.substring(1);
            }
            id = t.join(s);
        }
        view[id] = {
            id: id
          , render: templateElement === null ? null : swig.compile(templateElement.innerHTML, { filename: id })
          , $container: $(this)
        };
    });

    // Set Stripe and disable touchstart on toolbar
    
    Stripe.setPublishableKey(STRIPE_PUBLISHABLE_KEY);
    $(".toolbar").bind('touchstart', function() { return false; });
    self.loadVenues();

    // Get current user information

    framework.service.getCurrentUser(function (data) {
        currentUser = data.user;
        hasLoadedUser = true;
        initialize();
    });
    
    Zepto(function ($) {
        hasLoadedDocument = true;
        //showView(view.splash);
        showSpinner();
        self.buildWelcomeView();
        self.buildSignUpView();
        self.buildSignInView();
        self.buildSaveCreditCardView();
        hideCheckout();
        hideTopbar();
        initialize();
    });

    return self;
})();