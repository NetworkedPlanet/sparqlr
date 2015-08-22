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
        "submit .addChart": function(event){
            event.preventDefault();
            var chartId = Meteor.call('addChart', event.target.title.value);
            Router.go('/chart/' + chartId);
        }
    });

    Template.home.helpers({
        charts: function(){
            console.log('Getting the charts');
            var allTheCharts = Charts.find();
            console.log('There are ' + allTheCharts.length + ' charts');
            return allTheCharts;
        }
    });

  Template.chart.events({
      "click #loadData": function (event) {
      event.preventDefault();
      var dataSource = event.target.dataSource.value;
        d3.csv(dataSource, function(rows){
            var table = d3.selectAll('table');
            var tr = table.selectAll('tr').data(rows).enter().append('tr');
            var td = tr.selectAll('td').data(function(d){
                return Object.keys(d).map(function(k){return d[k]});
            }).enter().append('td').text(function(d) { return d; });
            var xAxisSelect = d3.selectAll('select');
            xAxisSelect.selectAll('option').data(Object.keys(rows[0])).enter()
                .append('option')
                .attr('value', function(d){ return d;})
                .text(function(d) { return d;});
        });
    },
      "submit .newChart": function(event){
          event.preventDefault();
            Meteor.call('updateChart', this._id, event.target.title.value, event.target.dataSource.value,{
                type: 'line',
                xAxis: event.target.xAxisSelect.value,
                yAxis: event.target.yAxisSelect.value
            })
      }
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
            set: {
                title: title,
                dataSource: source,
                displayOptions: displayOptions
            }
        })
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
});
