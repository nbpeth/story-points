import {VotingScheme} from '../voting-booth/voting.model';

export class PointSelection {
  options: any[];
  votingScheme: VotingScheme;
}

export class DefaultPointSelection implements PointSelection {
  options = [
    '0', '1', '2', '3', '5', '8', '13', '21', '34', 'Abstain'
  ];
  votingScheme = VotingScheme.Fibbonaci;
}

export class FistOfFivePointSelection implements PointSelection {
  options = ['0', '1', '2', '3', '4', '5'];
  votingScheme = VotingScheme.FistOfFive;
}

export class PrimePointSelection implements PointSelection {
  options = ['2', '3', '5', '7', '11', '13', '17', '19', '23', '29', '31', '37', '41', '43', '47', '53', '59', '61', '67', '71', '73', '79', '83', '89', '97'];
  votingScheme = VotingScheme.Primes;
}


export function makePointSelection(votingScheme: string): PointSelection {
  switch (votingScheme) {
    case VotingScheme.Fibbonaci as string:
      return new DefaultPointSelection();
    case VotingScheme.FistOfFive as string:
      return new FistOfFivePointSelection();
    case VotingScheme.Primes as string:
      return new PrimePointSelection();
    case undefined:
      return new DefaultPointSelection();
  }
}
