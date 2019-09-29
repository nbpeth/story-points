
export class Participant {
  constructor(
    public name: string,
    public point: number | string) {
    if (!name) {
      this.name = `Lurker ${Math.random()}`
    }
  }
}

export class StoryPointSession {
  participants: {
    [name: string]: Participant
  };
}
