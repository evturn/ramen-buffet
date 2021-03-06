RB.ListItem = Backbone.View.extend({

  className: 'list-item',
  listTemplate: _.template($('#list-name-template').html()),

  events: {
    'click .inner-container' : 'selected'
  },
  initialize() {
    this.render();
  },

  render() {
    this.$el.html(this.listTemplate(this.model.toJSON()));

    return this;
  },

  selected(e) {
    let listId = $(e.currentTarget).data('id'),
        $barContainer = $('.active-progress');

    $barContainer.empty();
    app.setNotes(listId);
    app.setActiveListId(listId);
  },
});