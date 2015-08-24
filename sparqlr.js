Charts = new Mongo.Collection("charts");

if (Meteor.isServer) {
  Meteor.publish("charts", function() {
    return Charts.find({
      owner: this.userId
    });
  });
}

if (Meteor.isClient) {

  Meteor.subscribe('charts');

  Template.home.events({
    "submit .addChart": function(event) {
      event.preventDefault();
      var chartId = Meteor.call('addChart', event.target.title.value);
      Router.go('/chart/' + chartId);
    }
  });

  Template.home.helpers({
    charts: function() {
      console.log('Getting the charts');
      var allTheCharts = Charts.find();
      console.log('There are ' + allTheCharts.length + ' charts');
      return allTheCharts;
    }
  });

  Template.chart.helpers({
    dataTable: function() {
      return Session.get('data') || [];
    }
  });

  Template.chart.events({
    "click #loadData": function(event, template) {
      event.preventDefault();
      var dataSource = template.find('#dataSource').value;
      d3.csv(dataSource, function(rows) {
        Session.set('data', rows);
        var xAxisSelect = d3.selectAll('select');
        xAxisSelect.selectAll('option').data(Object.keys(rows[0])).enter()
          .append('option')
          .attr('value', function(d) {
            return d;
          })
          .text(function(d) {
            return d;
          });
      });
    },
    "submit .newChart": function(event) {
      event.preventDefault();
      Meteor.call('updateChart', this._id, event.target.title.value, event.target.dataSource.value, {
        type: 'line',
        xAxis: event.target.xAxisSelect.value,
        yAxis: event.target.yAxisSelect.value
      });
        Router.go('/view/' + this._id);
    }
  });

    Template.chartView.onRendered(function(){
        console.log('Eep');
        var template = this.data;
            d3.csv(template.dataSource, function(rows){
                var data = rows.map(function(row){ return { x: row[template.displayOptions.xAxis], y:row[template.displayOptions.yAxis]}});
               var svg = d3.selectAll('.chart')
                   .selectAll('div')
                   .data(data).enter()
                   .append('div').style(function(d) { return {width: d.y};})
                   .text(function(d){return d.x;} )

            });
    });

    Accounts.ui.config({
        passwordSignupFields: "USERNAME_ONLY"
    });
}

Meteor.methods({
  addChart: function(title) {
    if (!Meteor.userId()) {
      throw new Meteor.Error("not-authorized");
    }

    return Charts.insert({
      title: title,
      createdAt: new Date(),
      owner: Meteor.userId(),
      username: Meteor.user().username
    });
  },

    updateChart: function(chartId, title, source, displayOptions) {
        var chart = Charts.findOne(chartId);
        Charts.update(chartId, {
            $set: {
                title: title,
                dataSource: source,
                displayOptions: displayOptions
            }
        });
    },

    setOptions : function(chartId, opts){
        var chart = Charts.findOne(chartId);
        Charts.update(chartId, { set: { opts: opts }});
    },
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
    'chart',
    {
        path: '/chart/:_id',
        layoutTemplate: 'shell',
        data: function(){
            return Charts.findOne({_id: this.params._id});
        }
    }
  );
    this.route(
        'chartView',
        {
            path: '/view/:_id',
            layoutTemplate: 'shell',
            data: function(){
                return Charts.findOne({_id: this.params._id});
            },
        }
    )
});
