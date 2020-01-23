import {VotingScheme} from '../control-panel/control-panel.component';

export class PointSelection {
  options: any[];
}

export class DefaultPointSelection implements PointSelection {
  options = [0, 1, 2, 3, 5, 8, 13, 21, 34, 'Abstain'];
}

export class FistOfFivePointSelection implements PointSelection {
  options = [0, 1, 2, 3, 4, 5];
}

export class PrimePointSelection implements PointSelection {
  options = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71, 73, 79, 83, 89, 97];
}
