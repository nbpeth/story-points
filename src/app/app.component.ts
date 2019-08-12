import {Component, OnInit} from '@angular/core';
import {SocketService} from './services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {

  private participants = [];

  constructor(private socketService: SocketService) {
  }

  ngOnInit() {

    this.socketService.getSocket().subscribe(x => {
      console.log('something happened!!!', x);
      /*
        I need to update everything from the event including what I did
       */
    });
  }


  submitValue = () => {
    this.socketService.send({why: 'would you do that'});
  };
}


export class Participant {
  constructor(public name: string) {
  }
}
