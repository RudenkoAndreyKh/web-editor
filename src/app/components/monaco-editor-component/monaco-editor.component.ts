import { Component, Input, OnInit } from '@angular/core';
import * as MonacoEditor from 'monaco-editor';
import { iconList } from 'src/app/enums/file-type-enum';
import { FileObserver } from 'src/app/services/file-observable.service';
import { SidePanelObserver } from 'src/app/services/side-panel-observable.service';
import { TodoItemNode } from '../interactive-list/checklist-database';

import getProgrammingLanguage from "detect-programming-language";

interface IMonacoInit {
    language: any;
    theme: string;
    value: string;
}
@Component({
    selector: 'app-monaco-editor',
    templateUrl: './monaco-editor.component.html',
    styleUrls: ['./monaco-editor.component.scss']
})

export class MonacoEditorComponent implements OnInit {
    @Input('width') public width: number = window.innerWidth - 240;

    currentFile?: TodoItemNode | null;

    constructor(private sidePanelObserver: SidePanelObserver, private FileObserver: FileObserver) { }

    ngOnInit(): void {
        this.initMonaco({
            language: 'javascript',
            theme: 'vs-dark',
            value: '',
        });

        this.sidePanelObserver.widthSubscriber$
            .subscribe(width => {
                this.width = window.innerWidth - width - 40;
            });

        this.FileObserver.currentOpenedFileSubscriber$
            .subscribe(currentFile => {
                this.currentFile = currentFile;
                this.changeEditorOptions(currentFile!);
            });
    }

    changeEditorOptions(currentFile: TodoItemNode) {
        const fileName = currentFile?.name;
        const re = /(?:\.([^.]+))?$/;
        const fileType: any = re.exec(fileName!)![0];

        //change inner text value
        MonacoEditor.editor.getModels()[0].setValue(currentFile?.innerText!);
        if (fileType) {
            const language = getProgrammingLanguage(fileType).toLowerCase();

            //change programming language
            MonacoEditor.editor.setModelLanguage(MonacoEditor.editor.getModels()[0], language);
        } else {
            MonacoEditor.editor.setModelLanguage(MonacoEditor.editor.getModels()[0], 'plaintext');
        }
    }

    initMonaco({ language, theme, value }: IMonacoInit): void {
        const container: HTMLElement = document.getElementById('container') as HTMLElement;
        if (typeof (container) !== null) {
            MonacoEditor.editor.create(container, {
                value: value,
                language: language,
                theme: theme,
                scrollBeyondLastLine: false,
                automaticLayout: true
            });
        }
    }
}
