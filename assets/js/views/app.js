RB.App = Backbone.View.extend({

  el: '.dmc',

  initialize: function() {
    RB.e.fixPath();
    this.get();
    RB.e.init();
  },

  events: {
    'click .lists-container .list-item' : 'renderList',
    'click .create-list-btn' : 'createList'
  },

  renderList: function(e) {
    var listname = $(e.currentTarget).data('id');
    var notes = RB.collection.where({list: listname});

    RB.setNotes('.active-notes-container', notes);
    RB.e.deviceEnv(400);

  },

  createList: function() {
    var $noteInput = $('.note-input');
    var $listInput = $('.list-input');
    var $notesContainer = $('.active-notes-container');

    $noteInput.val('');
    $listInput.val('').focus();
    $notesContainer.empty();
  },



});