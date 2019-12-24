export class Participant {
  constructor(
    public participantName?: string,
    public participantId?: number,
    public point?: number | string,
    public hasVoted?: boolean,
    public isAdmin?: boolean,
  ) {
    if (!participantName) {
      this.participantName = `Lurker${Math.floor(Math.random() * 1000000)}`;
    }
  }
}

export class StoryPointSession {
  participants: Participant[] = [];
  sessionId: number;
  sessionName: string;

  setName = (name: string) => {
    console.log('set name', name)
    this.sessionName = name;
  }
}
