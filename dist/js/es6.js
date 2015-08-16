'use strict';

var RB = {};

RB.User = Backbone.Model.extend({
  url: '/users',
  idAttribute: '_id'
});

RB.Note = Backbone.Model.extend({
  idAttribute: '_id'
});

RB.List = Backbone.Model.extend({
  idAttribute: '_id'
});

RB.Lists = Backbone.Collection.extend({
  model: RB.List,
  url: '/notes'
});

// Should be converted to User?
RB.Notes = Backbone.Collection.extend({
  model: RB.Note,
  url: '/notes',
  merge: true
});
// ===================
// HTTP
// ===================

'use strict';

_.extend(Backbone.View.prototype, {

  start: function start() {
    var user = new RB.User();
    this.helpers.init(this);

    user.fetch({

      success: function success(model, response) {
        if (app.user === null) {
          app.user = model;
        }

        if (app.listsCollection === null) {
          app.listsCollection = new RB.Lists(model.attributes.lists);
          app.setLists();
        }

        return app.listsCollection;
      },
      error: function error(err) {
        console.log(err);
      }

    });
  },

  post: function post(model) {
    var self = this,
        $noteInput = $('.note-input'),
        $notesContainer = $('.active-notes-container');

    $.ajax({
      url: '/notes/',
      method: 'POST',
      data: model,
      success: function success(model, response) {
        console.log(model);
        $noteInput.val('').focus();
        app.validate();
        var note = new RB.Note(model);
        var view = new RB.NoteItem({ model: note });
        $notesContainer.append(view.render().el);
        view.notify('Created');
        self.updateListTotal();
      },
      error: function error(err) {
        console.log(err);
      }
    });
  },

  put: function put(model, attributes, view) {
    var self = this,
        id = model.get('_id');

    model.save(attributes, {

      url: '/notes/' + id,
      success: function success(model, response) {
        self.notify('Updated');
        view.render();
      },
      error: function error(_error) {
        console.log('error ', _error);
      }
    });
  },

  destroy: function destroy(model) {
    var self = this,
        id = model.get('_id'),
        listId = self.getActiveListId();

    model.set('listId', listId);

    if (id !== null) {

      model.destroy({
        url: '/notes/' + id + '?listId=' + listId,
        success: function success(model, response) {
          console.log('success ', model);
          self.notify('Removed');
          self.updateListTotal();
        },
        error: function error(err) {
          console.log('error ', err);
        }
      });
    }
  }
});
// ===================
// View Helpers
// ===================

'use strict';

_.extend(Backbone.View.prototype, {

  garbageTemplate: _.template($('#garbage-watcher-template').html()),
  allDoneTemplate: _.template($('#sunny-template').html()),

  setLists: function setLists() {
    var $container = $('.lists-container');
    $container.empty();

    app.listsCollection.each(function (model) {
      var view = new RB.ListItem({ model: model });

      $container.append(view.render().el);
    });
  },

  setNote: function setNote(model) {
    var $notesContainer = $('.active-notes-container');
    var view = new RB.NoteItem({ model: model });

    $notesContainer.append(view.render().el);
  },

  setNotes: function setNotes(id) {
    var list = app.listsCollection.get(id),
        notes = new RB.Notes(list.attributes.notes),
        listname = list.attributes.name,
        $container = $('.active-notes-container'),
        $listInput = $('.active-input.list-input'),
        $noteInput = $('.active-input.note-input');

    $container.empty();
    $listInput.val(listname);

    notes.each(function (note) {
      var view = new RB.NoteItem({ model: note });

      $container.append(view.render().el);
    });

    app.notesCollection = notes;
    app.listenTo(app.notesCollection, 'change', this.updateListTotal);
    this.resetActiveList(listname);
  },

  getActiveListId: function getActiveListId() {
    var id = app.activeListId;

    return id;
  },

  setActiveListId: function setActiveListId(id) {
    var $container = $('.active-notes-container');

    $container.attr('data-list', id);
    app.activeListId = id;

    return this;
  },

  setListValue: function setListValue(listname) {
    var $listInput = $('.active-input.list-input');

    $listInput.val(listname);
  },

  resetActiveList: function resetActiveList(listname) {
    var $listItem = $('.list-item'),
        $element = $('div').find("[data-id='" + listname + "']");

    $listItem.removeClass('active');
    $element.addClass('active');

    return $element;
  },

  appendActiveListStats: function appendActiveListStats() {
    var number = app.notesCollection.where({ done: true }).length,
        $garbageContainer = $('.garbage-container'),
        $statContainer = $('.garbage-container .stat'),
        $trashContainer = $('.garbage-container .edit');

    $garbageContainer.empty();

    if (number !== 0) {
      $garbageContainer.html(this.garbageTemplate({ length: number }));
    } else {
      $garbageContainer.html(this.allDoneTemplate());
    }

    return this;
  },

  updateListTotal: function updateListTotal() {
    var $container = $('.active-notes-container');

    console.log($container.children().length);
  }

});
// ===================
// Helpers
// ===================

'use strict';

_.extend(Backbone.View.prototype, {

  helpers: {

    init: function init(self) {
      self.fixPath();
      self.onClickSetActive();
      self.isMobile(800);
    }
  },

  notify: function notify(notification) {
    var $loader = $('.kurt-loader');

    $loader.html('<p class="thin-sm animated fadeIn">' + notification + '</p>');

    var $paragraphTag = $loader.find('.thin-sm');

    setTimeout(function () {
      $paragraphTag.removeClass('animated fadeIn');
      $paragraphTag.addClass('animated fadeOut');
    }, 1000);
  },

  tojquery: function tojquery(element) {

    switch (typeof element) {
      case "object":
        if (element instanceof jQuery) {
          return element;
        }
        break;

      case "string":
        if (element.charAt(0) === '.') {
          return $(element);
        } else {
          return $(document.getElementsByClassName(element));
        }
    }
  },

  convertDate: function convertDate(date) {
    var d = new Date(date),
        days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
        year = d.getFullYear(),
        month = d.getMonth(),
        day = d.getDate(),
        hours = d.getHours(),
        minutes = d.getMinutes(),
        min = minutes > 10 ? minutes : '0' + minutes,
        meridiem = hours >= 12 ? 'PM' : 'AM',
        hour = hours > 12 ? hours - 12 : hours;

    month = ('' + (month + 1)).slice(-2);
    var timestamp = days[d.getDay()] + ' ' + month + '/' + day + ' ' + hour + ':' + min + meridiem;

    return timestamp;
  },

  onClickSetActive: function onClickSetActive() {
    $(document).on('click', '.lists-container .list-item', function () {
      var $listItem = $('.list-item');

      $listItem.removeClass('active');
      $(this).addClass('active');
    });
  },

  toggleLists: function toggleLists() {
    var $listsContainer = $('.lists-container'),
        $icon = $('.toggle-list-btn .fa');

    $listsContainer.slideToggle('fast');
    $icon.toggleClass('collapsed');
  },

  isMobile: function isMobile(duration) {
    var device = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (device) {
      setTimeout(this.toggleLists, duration);
    }
  },

  sunny: function sunny() {
    var counter = 0;

    setInterval(function () {
      $('.fa.fa-certificate').css({ '-ms-transform': 'rotate(' + counter + 'deg)' }).css({ '-moz-transform': 'rotate(' + counter + 'deg)' }).css({ '-o-transform': 'rotate(' + counter + 'deg)' }).css({ '-webkit-transform': 'rotate(' + counter + 'deg)' }).css({ 'transform': 'rotate(' + counter + 'deg)' });
      counter += 3;
    }, 100);
  },

  fixPath: function fixPath() {

    if (window.location.hash && window.location.hash === "#_=_") {
      var _scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      };

      window.location.hash = "";
      document.body.scrollTop = _scroll.top;
      document.body.scrollLeft = _scroll.left;
    }
  }
});
'use strict';

RB.App = Backbone.View.extend({

  el: '.dmc',

  inputTemplate: _.template($('#input-template').html()),

  user: null,
  listsCollection: null,
  notesCollection: null,
  activeListId: null,

  initialize: function initialize() {
    this.renderInputFields();
  },

  events: {
    'click .create-list-btn': 'createList',
    'click .toggle-list-btn': 'toggleLists',
    'click .create-note-btn': 'createNote',
    'keyup .note-input': 'createOnEnter',
    'keyup .active-input': 'validate'
  },

  createList: function createList() {
    var $noteInput = $('.note-input');
    var $listInput = $('.list-input');
    var $notesContainer = $('.active-notes-container');

    $noteInput.val('');
    $listInput.val('').focus();
    $notesContainer.empty();
  },

  renderInputFields: function renderInputFields() {
    $('.active-list-container').html(this.inputTemplate());

    return this;
  },

  createOnEnter: function createOnEnter(e) {
    if (e.keyCode === 13) {
      this.createNote();
    }
  },

  validate: function validate() {
    var $body = $('.note-input').val();
    var $list = $('.list-input').val();
    var $check = $('.create-note-btn .fa');

    if ($body.trim() && $list.trim() !== '') {
      $check.addClass('ready');
    } else {
      $check.removeClass('ready');
    }
  },

  createNote: function createNote() {
    var body = $('.note-input').val(),
        list = $('.list-input').val();

    if (body.trim() && list.trim() !== '') {

      var note = {
        body: body,
        list: list,
        done: false
      };

      if (app.listsCollection.length > 0) {

        for (var i = 0; i < app.listsCollection.length; i++) {
          var inMemory = app.listsCollection.models[i].body;

          if (note.body === inMemory) {
            return false;
          }
        }
      }

      this.post(note);
    }
  }

});
'use strict';

RB.ListItem = Backbone.View.extend({

  className: 'list-item',
  listTemplate: _.template($('#list-name-template').html()),
  events: {
    'click .inner-container': 'selected'
  },
  initialize: function initialize() {
    this.render();
  },

  render: function render() {
    this.$el.html(this.listTemplate(this.model.toJSON()));

    return this;
  },

  selected: function selected(e) {
    var listId = $(e.currentTarget).data('id');

    this.setNotes(listId);
    this.setActiveListId(listId);
    this.appendActiveListStats();
    this.isMobile(400);
  }

});
'use strict';

RB.NoteItem = Backbone.View.extend({

  className: 'list-item',

  itemTemplate: _.template($('#note-item-template').html()),
  attributes: {},
  initalize: function initalize() {
    this.listenTo(this.model, 'destroy', this.remove);
  },

  events: {
    'click .edit .fa-trash': 'destroyNote',
    'click .edit .fa-check-square': 'toggleDone',
    'click .note-text': 'positionCursor',
    'blur .note-text': 'updateNoteBody',
    'keyup .note-text': 'updateNoteOnEnter'
  },

  render: function render() {
    if (!this.model.get('timestamp') && this.model.get('created')) {
      var created = this.model.get('created');

      this.model.set('timestamp', this.convertDate(created));
    } else if (!this.model.get('timestamp') && !this.model.get('created')) {
      this.model.set('timestamp', this.convertDate(new Date()));
    }

    if (!this.model.get('done')) {
      this.model.set('done', false);
    }

    this.$el.html(this.itemTemplate(this.model.toJSON()));

    return this;
  },

  positionCursor: function positionCursor(e) {
    var $input = $(e.currentTarget);
    var range = $input.val().length;

    if ($input.hasClass('busy')) {
      return false;
    } else {
      $input.addClass('busy');
      $input[0].setSelectionRange(range, range + 1);
    }
  },

  destroyNote: function destroyNote() {
    this.destroy(this.model);
    this.remove();
  },

  toggleDone: function toggleDone() {
    var isDone = this.model.get('done');
    var listId = this.getActiveListId();
    var attributes = {
      done: !isDone,
      listId: listId
    };

    this.put(this.model, attributes, this);
  },

  updateNoteBody: function updateNoteBody(e) {
    var $input = $(e.currentTarget);
    var content = $input.val().trim();
    var listId = this.getActiveListId();
    var attributes = { body: content, listId: listId };

    $input.removeClass('busy');
    this.put(this.model, attributes, this);
  },

  updateNoteOnEnter: function updateNoteOnEnter(e) {
    var $input = $(e.currentTarget);

    if (e.keyCode === 13) {
      $input.blur();
    }
  }

});
"use strict";

var app = new RB.App();
app.start();