

// @Component({
//   selector: 'app-session',
//   templateUrl: './session.component.html',
//   styleUrls: ['./session.component.scss']
// })
export class Session {
  id: string;
  sessionState: any;

  // private participants = {};
  // private participant: Participant;

  // todo: server will need to know state to notify new clients
  // constructor(private socketService: SocketService) {
  // }

  // ngOnInit() {
    // this.socketService
    //   .getSocket()
    //   .subscribe(this.handleEvents);
  // }

  // getParticipants = () => this.participants;

  // getParticipant = () => this.participant;

  // submit = (value) => {
  //   this.socketService.send({[Events.VALUE_SUBMITTED]: {[this.participant.name]: new ParticipantMetaData(value)}});
  // };

  // resetPoints = () => {
  //   Object.values(this.participants).forEach((participant: ParticipantMetaData) => {
  //     participant.point = 0;
  //   });

  //   this.socketService.send({[Events.PARTICIPANT_UPDATE]: this.participants});
  // };

  // revealPoints = () => {

  // }

  // joinSession = (name: string) => {
  //   // if name exists, can't do it -> error

  //   this.addLocalParticipantBy(name);
  //   this.socketService.send({[Events.PARTICIPANT_UPDATE]: this.participants});
  // };

  // leaveSession = () => {
  //   this.removeLocalParticipant();
  //   this.socketService.send({[Events.PARTICIPANT_UPDATE]: this.participants});
  // };

  // lurker = (): boolean => !this.participant;

  // private handleEvents = (event: MessageEvent) => {
  //   const json = JSON.parse(event.data);
  //   const eventKey = Object.keys(json)[0];
  //   const data = Object.values(json)[0];

  //   switch (eventKey) {
  //     case Events.PARTICIPANT_UPDATE:
  //       this.refreshUsersFrom(data);
  //       break;
  //     case Events.VALUE_SUBMITTED:
  //       this.participants = {...this.participants, ...data};
  //       break;
  //   }
  // };

  // private addLocalParticipantBy = (name) => {
  //   this.participant = new Participant(name);
  //   this.participants[this.participant.name] = new ParticipantMetaData();

  // };

  // private removeLocalParticipant = () => {
  //   delete this.participants[this.participant.name];
  //   this.participant = undefined;
  // };

  // private refreshUsersFrom = (participantsFromServer) => {
  //   this.participants = participantsFromServer;
  // };

}
