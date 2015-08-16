'use strict';

var RB = {};

RB.Note = Backbone.Model.extend({
  idAttribute: '_id'
});

RB.Notes = Backbone.Collection.extend({
  model: RB.Note,
  url: '/notes',
  merge: true
});

RB.User = Backbone.Model.extend({
  idAttribute: '_id'
});
'use strict';

_.extend(Backbone.View.prototype, {

  garbageTemplate: _.template($('#garbage-watcher-template').html()),
  allDoneTemplate: _.template($('#sunny-template').html()),

  collection: null,

  get: function get() {
    var self = this;
    var notes = new RB.Notes();

    notes.fetch({

      success: function success(collection) {

        if (self.collection === null) {
          app.collection = collection;
          console.log(app.collection);
        }

        var lists = self.getLists(app.collection);
        self.setLists(lists);
      },
      error: function error(err) {
        console.log(err);
      }

    });
  },

  post: function post(model) {
    var self = this;
    var $noteInput = $('.note-input');
    var $notesContainer = $('.active-notes-container');

    app.collection.create(model, {

      success: function success(model, response) {
        $noteInput.val('').focus();
        app.validate();
        var view = new RB.NoteItem({ model: model });
        $notesContainer.append(view.render().el);
        self.onChangeListeners();
        self.notify('Created');
      },
      error: function error(err) {
        console.log(err);
      }

    });
  },

  put: function put(model, attributes, view) {
    var self = this;
    var id = model.get('_id');
    var listname = model.get('list');

    model.save(attributes, {

      url: '/notes/' + id,
      success: function success(model, response) {
        self.notify('Updated');
        self.onChangeListeners();
        view.render();
      },
      error: function error(_error) {
        console.log(_error);
      }
    });
  },

  destroy: function destroy(model) {
    var self = this;
    var listname = model.get('list');
    var id = model.get('_id');

    if (id !== null) {

      model.destroy({
        wait: true,
        url: '/notes/' + id,
        dataType: 'text',
        data: { _id: id },
        success: function success(model) {
          console.log('success ', model);
          self.notify('Removed');
          self.onChangeListeners();
        },
        error: function error(err) {
          console.log('error ', err);
        }
      });
    }
  },

  getNotesByListname: function getNotesByListname(listname) {
    var notes = this.collection.where({ list: listname });

    return notes;
  },

  getLists: function getLists() {
    var self = this;
    var arr = [];

    this.collection.each(function (model) {
      var listname = model.get('name');

      if (arr.indexOf(listname) === -1) {
        arr.push(listname);
      }
    });

    return arr;
  },

  setLists: function setLists(array) {
    var lists = array;
    var template = _.template($('#list-name-template').html());
    var $listsContainer = $('.lists-container');

    $listsContainer.empty();

    for (var i = 0; i < lists.length; i++) {
      var total = this.collection.where({
        list: lists[i]
      }).length;

      $listsContainer.append(template({
        name: lists[i],
        length: total
      }));
    }
  },

  setNote: function setNote(model) {
    var $notesContainer = $('.active-notes-container');
    var view = new RB.NoteItem({ model: model });

    $notesContainer.append(view.render().el);
  },

  setNotes: function setNotes(selector, models) {
    var $notesContainer = $('.active-notes-container');
    var $listInput = $('.active-input.list-input');
    var $noteInput = $('.active-input.note-input');

    if (models.length > 0) {
      var listname = models[0].get('list');

      $listInput.val(listname);
      var $selector = this.tojquery(selector);
      $selector.empty();

      for (var i = 0; i < models.length; i++) {
        var note = models[i];
        var view = new RB.NoteItem({ model: note });

        $selector.append(view.render().el);
      }

      this.resetActiveList(listname);
    } else {
      $listInput.val('');
      $noteInput.val('');
      $notesContainer.empty();
    }

    if (!this.isMobile()) {
      $noteInput.focus();
    }
  },

  setListValue: function setListValue(listname) {
    var $listInput = $('.active-input.list-input');
    $listInput.val(listname);
  },

  resetActiveList: function resetActiveList(listname) {
    var $listItem = $('.list-item');
    var $element = $('div').find("[data-id='" + listname + "']");

    $listItem.removeClass('active');
    $element.addClass('active');

    return $element;
  },

  getListnameContainer: function getListnameContainer(listname) {
    var $element = $('div').find("[data-id='" + listname + "']");

    return $element;
  },

  notify: function notify(notification) {
    var $loader = $('.kurt-loader');
    $loader.html('<p class="thin-sm animated fadeIn">' + notification + '</p>');
    var $text = $loader.find('.thin-sm');

    setTimeout(function () {
      $text.removeClass('animated fadeIn');
      $text.addClass('animated fadeOut');
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
    var d = new Date(date);
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'];
    var year = d.getFullYear();
    var month = d.getMonth();
    var day = d.getDate();
    var hours = d.getHours();
    var minutes = d.getMinutes();
    var min = minutes > 10 ? minutes : '0' + minutes;
    var meridiem = hours >= 12 ? 'PM' : 'AM';
    var hour = hours > 12 ? hours - 12 : hours;
    month = ('' + (month + 1)).slice(-2);
    var timestamp = days[d.getDay()] + ' ' + month + '/' + day + ' ' + hour + ':' + min + meridiem;

    return timestamp;
  },

  init: function init() {
    this.fixPath();
    this.setActiveList();
    this.deviceEnv(800);
    this.sunny();
    this.setFirstChildActive();
    this.isListSelected();
  },

  deviceEnv: function deviceEnv(num) {
    if (this.isMobile()) {
      setTimeout(this.toggleLists, num);
    }
  },

  isListSelected: function isListSelected() {
    var $notesContainer = $('.active-notes-container .list-item');

    if ($notesContainer.length) {
      var listname = this.getCurrentList();

      this.resetActiveList(listname);
      return true;
    } else {
      return false;
    }
  },

  setFirstChildActive: function setFirstChildActive() {
    var listItem = $('.lists-container').first();

    listItem.addClass('active');
  },

  setActiveList: function setActiveList() {
    $(document).on('click', '.lists-container .list-item', function () {
      var $listItem = $('.list-item');

      $listItem.removeClass('active');
      $(this).addClass('active');
      $(document).trigger('listSelected');
    });
  },

  toggleLists: function toggleLists() {
    var $listsContainer = $('.lists-container');
    var $icon = $('.toggle-list-btn .fa');

    $listsContainer.slideToggle('fast');
    $icon.toggleClass('collapsed');
  },

  isMobile: function isMobile() {
    var device = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    return device;
  },

  onChangeListeners: function onChangeListeners() {
    var numberDone = this.garbageWatcher();
    this.appendDoneStats(numberDone);
    this.listWatcher();
    this.isListSelected();
  },

  getCurrentList: function getCurrentList() {
    var listname = $('.list-input').val();

    return listname;
  },

  garbageWatcher: function garbageWatcher() {
    var listname = this.getCurrentList();
    var number = app.collection.where({ list: listname, done: true }).length;

    return number;
  },

  appendDoneStats: function appendDoneStats(number) {
    var $garbageContainer = $('.garbage-container');
    var $statContainer = $('.garbage-container .stat');
    var $trashContainer = $('.garbage-container .edit');

    if (number !== 0) {
      $garbageContainer.html(this.garbageTemplate({ length: number }));
    } else {
      $garbageContainer.html(this.allDoneTemplate());
    }

    return this;
  },

  listWatcher: function listWatcher() {
    var template = _.template($('#list-name-template').html());
    var $listsContainer = $('.lists-container');
    var listname = $('.list-input').val();
    var activeList = this.resetActiveList(listname);
    var number = app.collection.where({
      list: listname
    }).length;

    $(activeList).remove();

    if (number > 0) {
      $listsContainer.prepend(template({
        name: listname,
        length: number
      }));
    }

    return this;
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
      var scroll = {
        top: document.body.scrollTop,
        left: document.body.scrollLeft
      };

      window.location.hash = "";
      document.body.scrollTop = scroll.top;
      document.body.scrollLeft = scroll.left;
    }
  }

});
'use strict';

RB.App = Backbone.View.extend({

  el: '.dmc',

  inputTemplate: _.template($('#input-template').html()),

  initialize: function initialize() {
    this.fixPath();
    this.get();
    this.init();
    this.renderInputFields();
  },

  events: {
    'click .lists-container .list-item': 'renderList',
    'click .create-list-btn': 'createList',
    'click .toggle-list-btn': 'toggleLists',
    'click .create-note-btn': 'createNote',
    'keyup .note-input': 'createOnEnter',
    'keyup .active-input': 'validate',
    'click .garbage-container': 'removeAllDone',
    'focus .list-input': 'isMakingNewList',
    'keyup .list-input': 'compareListValue'
  },

  grabValueSnapshot: function grabValueSnapshot() {

    if (this.isListSelected) {
      var listname = $('.list-input').val();

      return listname;
    }
  },

  isMakingNewList: function isMakingNewList() {
    var listnamesArray = this.getLists();
    var listname = this.grabValueSnapshot();

    if (listname) {
      this.currentList = listname;
      this.allLists = listnamesArray;
    } else {

      return false;
    }
  },

  compareListValue: function compareListValue() {
    var typing = $('.list-input').val();
    var $activeNotes = $('.active-notes-container');

    if (typing !== this.currentList) {
      $activeNotes.hide();
      this.checkMatchingLists(typing);
    } else {

      $activeNotes.show();
    }
  },

  checkMatchingLists: function checkMatchingLists(string) {
    var $notesContainer = $('.active-notes-container');
    var notes;

    for (var i = 0; i < this.allLists.length; i++) {

      if (string === this.allLists[i]) {

        notes = this.getNotesByListname(string);
        this.setNotes($notesContainer, notes);
        $notesContainer.show();
      }
    }
  },

  renderList: function renderList(e) {
    var listname = $(e.currentTarget).data('id');
    var notes = this.collection.where({ list: listname });

    this.setNotes('.active-notes-container', notes);
    this.deviceEnv(400);
    this.onChangeListeners();
  },

  createList: function createList() {
    var $noteInput = $('.note-input');
    var $listInput = $('.list-input');
    var $notesContainer = $('.active-notes-container');

    $noteInput.val('');
    $listInput.val('').focus();
    $notesContainer.empty();
    this.onChangeListeners();
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
    var $body = $('.note-input').val();
    var $list = $('.list-input').val();

    if ($body.trim() && $list.trim() !== '') {
      var date = Date.now();
      var timestamp = this.convertDate(date);

      var note = {

        body: $body,
        list: $list,
        created: date,
        timestamp: timestamp,
        done: false

      };

      var alreadyExists = this.collection.findWhere({
        body: note.body,
        list: note.list
      });

      if (alreadyExists) {

        return false;
      }

      this.post(note);
    }
  },

  removeAllDone: function removeAllDone() {

    if (this.isListSelected()) {
      var listname = $('.list-input').val();
      var models = this.collection.where({
        list: listname,
        done: true
      });

      console.log(models);

      _.invoke(models, 'destroy');
      return false;
    }
  }

});
'use strict';

RB.NoteItem = Backbone.View.extend({

  className: 'list-item',

  itemTemplate: _.template($('#note-item-template').html()),

  initalize: function initalize() {
    this.listenTo(this.model, 'destroy', this.remove);
    this.render();
  },

  events: {
    'click .edit .fa-trash': 'destroyNote',
    'click .edit .fa-check-square': 'toggleDone',
    'click .note-text': 'positionCursor',
    'blur .note-text': 'updateNoteBody',
    'keyup .note-text': 'updateNoteOnEnter'
  },

  render: function render() {
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
    var attributes = { done: !isDone };

    this.put(this.model, attributes, this);
  },

  updateNoteBody: function updateNoteBody(e) {
    var $input = $(e.currentTarget);
    var content = $input.val().trim();
    var attributes = { body: content };

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