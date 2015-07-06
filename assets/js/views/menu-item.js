var MenuItem = Backbone.View.extend({
  itemTemplate: _.template($('#list-name-item').html()),
  initalize: function() {
    this.render();
  },
  events: {
    'click .list-item' : 'select'
  },
  render: function(list) {
    this.$el.html(this.itemTemplate(list));
    return this;
  },
  select: function(e) {
    var $t = $(e.currentTarget).data('id');
    console.log($t);
  },
});