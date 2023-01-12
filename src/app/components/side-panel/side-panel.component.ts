import { Component, Input } from '@angular/core';
import { ResizeEvent } from 'angular-resizable-element';
import { SidePanelObserver } from 'src/app/services/side-panel-observable.service';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss']
})

export class SidePanelComponent {
  @Input('width') public width: number = 200;

  constructor(private sidePanelObserver: SidePanelObserver) { }

  onResizing(event: ResizeEvent): void {
    if (typeof (event.rectangle.width) == 'number') {
      if (event.rectangle.width > 75) {
        this.width = 150;
        this.sidePanelObserver.fileObserver(150);
      }
      if (event.rectangle.width < 75) {
        this.width = 0;
        this.sidePanelObserver.fileObserver(0);
      }
      if (event.rectangle.width > 150) {
        this.width = event.rectangle.width;
        this.sidePanelObserver.fileObserver(event.rectangle.width);
      }
    }
  }
}
