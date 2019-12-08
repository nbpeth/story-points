export class Participant {
  constructor(
    public name: string,
    public point: number | string,
    public hasVoted: boolean = false,
    public isAdmin: boolean = false,
  ) {
    if (!name) {
      this.name = `Lurker${Math.floor(Math.random() * 1000000)}`;
    }
  }
}

// move me somewhere meaningful
export class StoryPointSession {
  participants: {
    [name: string]: Participant
  };
}
