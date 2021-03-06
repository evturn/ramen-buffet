// ===================
// HTTP
// ===================

_.extend(Backbone.View.prototype, {

  get(options = {listDestroyed: false, _id: false}) {
    // listDestroyed : true  DELETE REQUEST (LIST)
    // _id           : true  POST REQUEST   (ALL)

    app.user.fetch({
      success(model, response) {
        app.listsCollection.stopListening();
        app.listsCollection = new RB.Lists(model.attributes.lists);

        if (options.listDestroyed) {
          // LIST DESTROYED, no notes to render
          app.setLists();
          app.setProgressBars();
        }
        else if (options._id) {
          // NOTE CREATED, render all and render notes
          app.activeListId = options._id;
          app.setActiveListId(options._id);
          app.setLists();
          app.setNotes(options._id);
          app.setProgressBars();
        }
        else {
          // NOTE UPDATED
          app.setNotes(app.activeListId);
          app.resetActiveList(app.activeListId);
          app.setProgressBars();
        }
      },
      error(err) {
        console.log(err);
      }
    });
  },

  post(model) {
    $.ajax({
      url: '/notes/',
      method: 'POST',
      data: model,
      success(model, response) {
        app.$noteInput.val('').focus();
        app.validate();
        app.notify(response);
        app.get({_id: model._id});
      },
      error(err) {
        console.log(err);
      }
    });
  },

  put(model, attributes, view) {
    let id = model.get('_id');

    model.save(attributes, {
      url: '/notes/' + id,
      success(model, response) {
        app.notify('Updated');
        app.get();
      },
      error(error) {
        console.log('error ', error);
      }
    });
  },

  destroy(model) {
    let id = model.get('_id');

    model.set('listId', app.activeListId);

    if (id !== null) {
      model.destroy({
        // Change route to '/lists/:id/notes/:id'
        url: '/notes/' + id + '?listId=' + app.activeListId,
        success(model, response) {
          console.log('success ', model);
          app.notify('Removed');
          app.get();
        },
        error(err) {
          console.log('error ', err);
        },
      });
    }
  },

  list: {

    put(model, attributes) {
      let id = model.get('_id');

      model.save(attributes, {
        url: '/lists/' + id,
        success(model, response) {
          app.notify('Updated');
          app.get();
        },
        error(error) {
          console.log('error ', error);
        }
      });
    },

    destroy(model, id) {
      if (id !== null) {
        model.destroy({
          url: '/lists/' + id,
          success(model, response) {
            console.log('success ', model);
            app.removeListItemById(id);
            app.notify('Removed');
            app.get({listDestroyed: true});
            app.createList();
          },
          error(err) {
            console.log('error ', err);
          },
        });
      }
    }
  },

  _user: {

    post(attributes) {
      $.ajax({
        url: '/users/login',
        method: 'POST',
        data: attributes,
        success(data, response) {
          console.log(data);
          $('.log-message').html('<h3 class="header-text animated fadeInUp">' + data + '</h3>');
        },
        error(err) {
          console.log(err);
        }
      });
    },

    put(attributes) {
      let id = app.user.get('_id');

      app.user.save(attributes, {
        url: '/users/facebook/' + id,
        success(model, response) {
          app.notify('Updated');
          console.log(model);
        },
        error(error) {
          console.log('error ', error);
        }
      });
    },
  }
});