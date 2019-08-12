export class Participant {
  constructor(public name: string) {
    if (!name) {
      this.name = `Lurker ${Math.random()}`;
    }
  }
}

export class ParticipantMetaData {
  constructor(public point: number = 0) {
  }
}
