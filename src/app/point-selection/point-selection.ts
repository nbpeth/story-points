export interface PointSelection {
    options: any[];
}

export class DefaultPointSelection implements PointSelection {
    options = [0, 1, 2, 3, 5, 8, 13, 21, 34, 'Abstain'];
}