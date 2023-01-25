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

    openedFilesObserver(newArray: TodoItemNode[]) {
        this.openedFiles.next(newArray);
    }

    focusedFileObserver(newFocusedFile: TodoItemNode | null) {
        this.focusedFile.next(newFocusedFile);
    }
} 