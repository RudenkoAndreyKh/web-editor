import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})

export class SidePanelObserver {
    private newWidth = new Subject<number>();
    widthSubscriber$ = this.newWidth;

    sidePanelWidthObserver(width: number) {
        this.newWidth.next(width);
    }
} 