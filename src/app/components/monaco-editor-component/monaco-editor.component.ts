import { Component, Input, OnInit } from '@angular/core';
import * as MonacoEditor from 'monaco-editor';
import { SidePanelObserver } from 'src/app/services/side-panel-observable.service';

@Component({
    selector: 'app-monaco-editor',
    templateUrl: './monaco-editor.component.html',
    styleUrls: ['./monaco-editor.component.scss']
})

export class MonacoEditorComponent implements OnInit {
    @Input('width') public width: number = window.innerWidth - 240;

    constructor(private sidePanelObserver: SidePanelObserver) { }

    ngOnInit(): void {
        this.initMonaco();

        this.sidePanelObserver.widthSubscriber$
            .subscribe(width => {
                this.width = window.innerWidth - width - 40;
            })
    }

    initMonaco(): void {
        const container: HTMLElement = document.getElementById('container') as HTMLElement;
        if (typeof (container) !== null) {
            MonacoEditor.editor.create(container, {
                value: `console.log('Welcome to Web-Editor');`,
                language: 'javascript',
                theme: 'vs-dark',
                scrollBeyondLastLine: false,
                automaticLayout: true
            });
        }
    }
}
