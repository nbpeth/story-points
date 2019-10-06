export class Participant {
  constructor(
    public name: string,
    public point: number | string,
    public hasVoted: boolean = false,
  ) {
    if (!name) {
      this.name = `Lurker ${Math.random()}`;
    }
  }
}

export class StoryPointSession {
  participants: {
    [name: string]: Participant
  };
}
