import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { TodoItemNode } from '../components/interactive-list/checklist-database';

@Injectable({
    providedIn: 'root',
})

export class FileObserver {
    private openedFiles = new Subject<TodoItemNode[]>();
    openedFilesSubscriber$ = this.openedFiles;

    private focusedFile = new Subject<TodoItemNode | null>();
    focusedFileSubscriber$ = this.focusedFile;

    private defocusedFile = new Subject<TodoItemNode | null>();
    defocusedFileSubscriber$ = this.defocusedFile;

    private currentOpenedFile = new Subject<TodoItemNode | null>();
    currentOpenedFileSubscriber$ = this.currentOpenedFile;

    openedFilesObserver(newArray: TodoItemNode[]) {
        this.openedFiles.next(newArray);
    }

    focusedFileObserver(newFocusedFile: TodoItemNode | null) {
        this.focusedFile.next(newFocusedFile);
    }

    defocusedFileObserver(newDefocusedFile: TodoItemNode | null) {
        this.defocusedFile.next(newDefocusedFile);
    }

    currentOpenedFileObserver(currentOpenedFile: TodoItemNode | null) {
        this.currentOpenedFile.next(currentOpenedFile);
    }
} 