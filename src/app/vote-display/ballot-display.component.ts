import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import * as Highcharts from 'highcharts';
import {ThemeService} from "../services/theme.service";
import {Options} from "highcharts";
import {PointSelection} from "../point-selection/point-selection";

@Component({
  selector: 'vote-display',
  templateUrl: './ballot-display.component.html',
  styleUrls: ['./ballot-display.component.scss']
})
export class BallotDisplayComponent implements OnInit, OnChanges {
  private seriesId = 'dataSeries';
  @Input() ballots: Ballot[];
  @Input() pointSelection: PointSelection;
  categories: any[];

  fontColor: string = 'white';


  chart: any;
  options = {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: 'bar',
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
        color: 'transparent',
        id: this.seriesId,
        data: [],
        borderWidth: 10,
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
          color: this.fontColor,
          cursor: 'default',
          fontSize: '25px',
        }
      }
    },
    yAxis: {
      visible: false,
      title: undefined,
      labels: {
        enabled: false,
      }
    },
  }

  constructor(private themeService: ThemeService) {
  }


  ngOnInit(): void {
    this.drawChart();

    this.themeService.isDarkTheme.subscribe((isDarkTheme: boolean) => {
      this.options.xAxis.labels.style.color = isDarkTheme ? 'white' : 'black';

      this.drawChart();

    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty('pointSelection')) {
      this.categories = this.pointSelection.options.map(v => v.toString());
    }
    if (changes.hasOwnProperty('ballots') && this.chart) {
      this.drawChart();
    }
  }

  private drawChart = () => {
    const distribution = this.calculateDistribution(this.ballots);

    this.options.xAxis.categories = this.categories;
    this.options.series[0].data = distribution;

    Highcharts.chart('chart', this.options as Options, (chart) => {
      this.chart = chart;
    });
  }


  private calculateDistribution = (ballots: Ballot[]) => {

    const categories: any[] = this.categories.slice().reduce((result, next) => {
      result.push({name: next, y: 0})
      return result;
    }, []);


    return ballots.reduce((result, next) => {
      const maybe = result.find(it => it.name == next);
      if (maybe) {
        maybe.y += 1;
      } else {
        result.push({name: next, y: 1});
      }
      return result;
    }, categories);
  }


}

export declare type Ballot = string | number | null | undefined;











