	angular.module('myApp')
		.controller('monitoringCtrl', ['$scope', function($scope) {
		google.charts.load('current', {'packages':['corechart']});
      google.charts.setOnLoadCallback(drawChart);

      function drawChart() {

        var data = google.visualization.arrayToDataTable([
          ['Clothes', 'Hours per Day'],
          ['Medicine',     15],
          ['Water',      7],
          ['Shelter',  3],
          ['Food', 8],
          ['Others',    10]
        ]);

        var options = {
          title: 'Percentage Needs %'
        };

        var chart = new google.visualization.PieChart(document.getElementById('piechart'));

        chart.draw(data, options);
      }

	}]);
