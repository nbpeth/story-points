export class Participant {
  constructor(
    public participantName?: string,
    public participantId?: number,
    public point?: number | string,
    public hasVoted?: boolean,
    public hasAlreadyVoted?: boolean,
    public isAdmin?: boolean,
    public pointsVisible?: boolean,
    public loginId?: string,
    public loginEmail?: string,
    public firstName?: string,
    public lastName?: string,
    public photoUrl?: string,

  ) {
    if (!participantName) {
      this.participantName = `Lurker${Math.floor(Math.random() * 1000000)}`;
    }
  }

  setPoint = (point: any) => {
    this.point = point;
  }
}

export class StoryPointSession {
  participants: Participant[] = [];
  sessionId: number;
  sessionName: string;
  pointsVisible: boolean;

  setName = (name: string) => {
    this.sessionName = name;
  };

  loadParticipants = (participants: Participant[]): void => {
    this.participants = participants;
    const first = participants.find(p => p);
    this.pointsVisible = first ? !!first.pointsVisible : false;
  };
}
