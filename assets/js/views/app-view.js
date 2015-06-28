var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');
var RB = require('../models/rb');

RB.app = Backbone.View.extend({
  el: '.app-container',
  initialize: function() {
    this.collection = new RB.list();
    this.render();
  },
  events: {
    'click .fa-plus' : 'getNotes'
  },
  render: function() {
    this.collection.fetch();
    console.log(this.collection);
  },
  getNotes: function() {
    console.log(this.collection);
    console.log(this.collection.fetch());
    console.log(this.collection);
  },
});


module.exports = RB;