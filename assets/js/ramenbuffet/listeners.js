RB.e = {
  init: function() {
    RB.e.setActiveList();
    RB.e.collapseLists();
    RB.e.expandLists();
  },
  setActiveList: function() {
    $(document).on('click', '.lists-container .list-item', function() {
      $('.list-item').removeClass('active');
      $(this).addClass('active');
    });
  },
  collapseLists: function() {
    $(document).on('click', '.toggle-list-btn.close-list', function() {
      var $lists = $('.lists-container');
      var $open = $('.toggle-list-btn.open-list');
      var $close = $('.toggle-list-btn.close-list');
      $close.addClass('hidden');
      $open.removeClass('hidden');
      $lists.slideToggle('fast');
    });
  },
  expandLists: function() {
    $(document).on('click', '.toggle-list-btn.open-list', function() {
      var $lists = $('.lists-container');
      var $open = $('.toggle-list-btn.open-list');
      var $close = $('.toggle-list-btn.close-list');
      $close.removeClass('hidden');
      $open.addClass('hidden');
      $lists.slideToggle('fast');
    });
  }
};