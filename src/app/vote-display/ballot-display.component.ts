import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import * as Highcharts from 'highcharts';
import {ThemeService} from "../services/theme.service";

@Component({
  selector: 'vote-display',
  templateUrl: './ballot-display.component.html',
  styleUrls: ['./ballot-display.component.scss']
})
export class BallotDisplayComponent implements OnInit, OnChanges {
  @Input() ballots: Ballot[];
  chart: any;

  options = {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'column',
      height: 250,
      backgroundColor: 'transparent',
      style: {
        fontFamily: '\'Unica One\', sans-serif'
      },
      plotBorderColor: '#606063'
    },
    legend: {enabled: false},
    title: {
      text: undefined
    },

    credits: {
      enabled: false
    },
    series: [
      {
        id: 'dataSeries',
        data: [],
      },
    ],
    tooltip: {enabled: false},

    plotOptions: {},
    xAxis: {
      id: 'cat',
      categories: [],
      crosshair: true,
      labels: {
        style: {
          color: '#666666',
          cursor: 'default',
          fontSize: '25px',
        }
      }
    },
    yAxis: {
      title: undefined,
      labels: {
        enabled: false,
      }
    },


  }

  constructor() {
    // colors by theme
    // fonts
    // series color

    // fit chart to window
    // react to inout
  }

  ngOnInit() {
    const distribution = this.calculateDistribution(this.ballots);
    const categories = this.getXAxisCategoriesFrom(distribution);

    this.options.xAxis.categories = this.getXAxisCategoriesFrom(distribution);
    this.options.series[0].data = distribution;

    this.chart = Highcharts.chart('chart', this.options);
  }

  ngOnChanges(changes: SimpleChanges): void {

  }


  private calculateDistribution = (ballots: Ballot[]) => {
    return ballots.reduce((result, next) => {
      const maybe = result.find(it => it.name === next);

      if (maybe) {
        maybe.y += 1;
      } else {
        result.push({name: next, y: 1});
      }

      return result;
    }, []);

  }

  private getXAxisCategoriesFrom = (distribution: { y, name }[]) =>
    distribution.map(point => point.name);
}

export declare type Ballot = string | number | null | undefined;











