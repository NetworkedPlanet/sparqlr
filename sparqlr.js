Charts = new Mongo.Collection("charts");

if (Meteor.isServer) {

}

if (Meteor.isClient) {
  Template.addChart.events({
    "submit .newChart": function (event) {
      event.preventDefault();
      var dataSource = event.target.dataSource.value;
      Meteor.call("addChart", dataSource);
    }
  });
}

Meteor.methods({
  addChart: function (dataSource) {
    if (! Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    Charts.insert({
      dataSource: dataSource,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },
  deleteTask: function (taskId) {
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can delete it
      throw new Meteor.Error("not-authorized");
    }
    Tasks.remove(taskId);
  },
  setChecked: function (taskId, setChecked) {
    var task = Tasks.findOne(taskId);
    if (task.private && task.owner !== Meteor.userId()) {
      // If the task is private, make sure only the owner can check it off
      throw new Meteor.Error("not-authorized");
    }
    Tasks.update(taskId, { $set: { checked: setChecked} });
  },
  setPrivate: function (taskId, setToPrivate) {
    var task = Tasks.findOne(taskId);
    // Make sure only the task owner can make a task private
    if (task.owner !== Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }
    Tasks.update(taskId, { $set: { private: setToPrivate } });
  }
});

Router.map(function(){
  this.route(
    'home',
    {path: '/', layoutTemplate: 'shell'}
  );
  this.route(
    'about',
    {path: '/about', layoutTemplate: 'shell'}
  );
  this.route(
    'addChart',
    {path: '/addChart', layoutTemplate: 'shell'}
  );
});
