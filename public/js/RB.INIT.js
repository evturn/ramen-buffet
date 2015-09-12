
(function() {

  let APP = {};

  APP.listsCollection  = null;
  APP.notesCollection  = null;
  APP.activeListId     = null;
  APP.activeListLength = null;
  APP.mobile           = null;
  APP.user             = null;
  APP.windowX          = window.innerWidth;

  APP.init = function() {
    APP.renderForm();
    APP.buildEnvironment();


  };

  APP.renderForm = function() {
    let $inputs = $('.inputs-container');

    $inputs.html(this.inputTemplate());
    autosize($('textarea'));

    return this;
  };

  APP.getDOMReferences = function() {
    APP.lists          = document.querySelector('.lists');
    APP.notes          = document.querySelector('.notes');
    APP.listInput      = document.querySelector('.list-input');
    APP.noteInput      = document.querySelector('.note-input');
    APP.notesContainer = document.querySelector('.notes-container');
    APP.listsContainer = document.querySelector('.lists-container');
  },

  APP.setUser = function() {
    let user = new RB.User();

    APP.user = user;
  };

  APP.buildEnvironment = function() {
    APP.setUser();
    APP.getDOMReferences();
  };

  APP.renderIcons = function() {
    let container = document.querySelector('.icon-select'),
        icons = '';

    for (let icon of RB.icons) {
      let i    = icon.icon,
          name = icon.name;

      icons = icons + `<div class="icon-option" data-icon="fa ${i}">
                        <i class="animated fadeIn fa ${i}"></i>
                        <p class="caption">${name}</p>
                       </div>`;
    }

    container.innerHTML = icons;
  };

  let E = {};

  E.init = function() {
    E.fixPath();
    E.setClient();
    E.isMobile();
    E.autosizeTextarea();
  };

  E.autosizeTextarea = function() {
    let textareas = document.querySelectorAll('textarea');

    autosize(textareas);
  };

  E.isMobile = function() {
    let device = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (device) {
      let body = document.querySelector('body');

      body.classList.add('mobile');
      APP.mobile = true;
    }

    return device;
  };

  E.fixPath = function() {
    if (window.location.hash && window.location.hash === "#_=_") {
        let scroll = {
          top  : document.body.scrollTop,
          left : document.body.scrollLeft
        };

        window.location.hash     = "";
        document.body.scrollTop  = scroll.top;
        document.body.scrollLeft = scroll.left;
    }
  };

  E.setClient = function() {
    let notes = document.querySelector('.notes'),
        lists = document.querySelector('.lists');

    if (APP.windowX > 600) {
        notes.classList.remove('expanded', 'collapsed');
        lists.classList.remove('expanded', 'collapsed');
        app.stopAnimation();
    }
    else {
        notes.classList.add('expanded');
        lists.classList.add('collapsed');
        app.animateContainers();
    }
  };

  E.animateContainer = function() {
    let lists = document.querySelector('.lists'),
        notes = document.querySelector('.notes'),
        isListsCollapsed = lists.classList.contains('collapsed'),
        isNotesCollapsed = notes.classList.contains('collapsed'),
        isListsExpanded = lists.classList.contains('expanded'),
        isNotesExpanded = notes.classList.contains('expanded');

    if (isListsCollapsed && isNotesExpanded) {
        lists.style.marginLeft = '-39%';
        notes.style.marginRight = '0%';
    }
    else if (isListsExpanded && isNotesCollapsed) {
        notes.style.marginRight = '-45%';
        lists.style.marginLeft = '0%';
    }
  };

  E.stopAnimation = function() {
    let lists = document.querySelector('.lists'),
        notes = document.querySelector('.notes');

    notes.style.marginRight = '0%';
    lists.style.marginLeft = '0%';
  };

  E.eventListeners = function() {
    app.fixPath();
    app.readClient();
    app.setClient();
    app.isMobile();
    autosize(document.querySelectorAll('textarea'));
    addEvent(window, 'resize', app.setClient);
    addEvent(querySelector('.nav-avatar'), 'click', app.toggleUserDropdown);
    addEvent(querySelector('.toggle-list-btn'), 'click', app.toggleLists);
    addEvent(querySelector('.active-progress'), 'click', app.toggleProgressBarDetails);
    addEvent(querySelector('.input-container .icon-container'), 'click', app.toggleIconsContainer);
    app.setListActive();
    app.onNewIconSelect();
  };


  //   app.user.fetch({
  //     success(model, response) {
  //       console.log(model);
  //       if (app.user === null) {
  //         app.user = model;
  //       }

  //       if (app.listsCollection === null) {
  //         app.listsCollection = new RB.Lists(model.attributes.lists);
  //         app.setLists();
  //         app.setProgressBars();
  //       }

  //       return app.listsCollection;
  //     },
  //     error(err) {
  //       console.log(err);
  //     }
  //   });
  // },





  //   init() {


  //     $(window).resize(function() {
  //       app.windowWidth = $(window).width();
  //       app.setClient();
  //     });

  //     $(document).on('click', '.nav-avatar', function() {
  //       app.toggleUserDropdown();
  //     });

  //     $(document).on('click', '.lists-container .list-item', function() {
  //       let $listItem = $('.list-item');

  //       $listItem.removeClass('active');
  //       $(this).addClass('active');
  //     });

  //     $(document).on('click', '.toggle-list-btn', function() {
  //       app.toggleLists();
  //     });

  //     $(document).on('click', '.active-progress', function() {
  //       $('.active-progress').toggleClass('show-details');
  //     });

  //     $(document).on('click', '.icon-container .list-icon', function() {
  //       $('.icon-dropdown').toggleClass('open');
  //     });

  //     $(document).on('click', '.icon-select .icon-option', function() {
  //       let icon = $(this).attr('data-icon'),
  //           $dropdown = $('.icon-dropdown'),
  //           $listItemIcon = app.getListItemIconById(app.activeListId);

  //       $dropdown.removeClass('open');
  //       app.updateListIcon(icon);
  //       $listItemIcon.addClass('bounce');
  //     });
  //   }
  // },
  // toggleLists(options={reset:false}) {
  //   app.$lists.toggleClass('collapsed');
  //   app.$lists.toggleClass('expanded');
  //   app.$notes.toggleClass('expanded');
  //   app.$notes.toggleClass('collapsed');

  //   if (app.windowWidth < 600) {
  //     app.animateContainers();
  //   }
  //   else {
  //     app.stopAnimation();
  //   }
  // },

  // notify(notification) {
  //   let $loader = $('.kurt-loader .message');

  //   $loader.html(notification);
  //   $loader.removeClass('animated fadeOut');
  //   $loader.addClass('animated fadeIn');

  //   setTimeout(function() {
  //     $loader.removeClass('animated fadeIn');
  //     $loader.addClass('animated fadeOut');
  //   }, 1000);
  // },

  // animateListTotal(list) {
  //   let $length = $('div').find("[data-length='" + list._id + "']");

  //   $length.removeClass('fadeInUp');
  //   $length.text(list.length);
  //   $length.addClass('fadeOutUp');

  //   setTimeout(function() {
  //     $length.removeClass('fadeOutUp');
  //     $length.addClass('fadeInUp');
  //     $length.show();

  //   }, 300);
  // },

  // hasLengthChanged(list) {
  //   if (app.activeListLength === list.length) {
  //     return false;
  //   }
  //   else {
  //     app.activeListLength = list.length;
  //     app.animateListTotal(list);

  //     return true;
  //   }
  // },
  // toggleUserDropdown() {
  //   $('.user-dd-list').toggleClass('on');
  // }


})();