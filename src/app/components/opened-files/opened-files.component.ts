import { Component, Input, OnInit } from '@angular/core';
import { iconList } from 'src/app/enums/file-type-enum';
import { FileObserver } from 'src/app/services/file-observable.service';
import { TodoItemFlatNode, TodoItemNode } from '../interactive-list/checklist-database';

@Component({
  selector: 'app-opened-files',
  templateUrl: './opened-files.component.html',
  styleUrls: ['./opened-files.component.scss']
})
export class OpenedFilesComponent implements OnInit {
  @Input() width: number = 0;
  openedFiles: TodoItemNode[] | undefined;
  currentOpenedFile: TodoItemNode | null = null;

  clickCount: number = 0;

  constructor(private FileObserver: FileObserver) {

  }

  ngOnInit() {
    this.FileObserver.openedFilesSubscriber$
      .subscribe(openedFiles => {
        this.openedFiles = openedFiles;
      });

    this.FileObserver.currentOpenedFileSubscriber$
      .subscribe(currentOpenedFile => {
        this.currentOpenedFile = currentOpenedFile;
      });
  }

  renderIcon(fileName: string) {
    const re = /(?:\.([^.]+))?$/;
    const fileType = re.exec(fileName);

    if (fileType && iconList[fileType[0]]) {
      return `assets/icons/file-types/${iconList[fileType[0]]}.svg`;
    }

    return 'assets/icons/file-types/default.svg'
  }

  closeFile(currentNode: TodoItemNode) {
    const newArray = [...this.openedFiles?.filter(node => currentNode.id !== node.id)!];
    this.FileObserver.currentOpenedFileObserver(newArray[newArray.length - 1] || null);
    this.FileObserver.openedFilesObserver(newArray);
  }

  doubleClick(newNode: TodoItemNode) {
    this.clickCount++;
    this.FileObserver.currentOpenedFileObserver(newNode);
    setTimeout(() => {
      if (this.clickCount === 2) {
        this.openNewFile(newNode);
      }
      this.clickCount = 0;
    }, 250)
  }

  openNewFile(newNode: TodoItemNode) {
    const openedNewIndex = this.openedFiles?.findIndex(node => node.isOpenedNew && node.id === newNode.id);

    if (this.openedFiles && this.openedFiles[openedNewIndex!]) {
      this.openedFiles![openedNewIndex!].isOpenedNew = null;
      this.FileObserver.openedFilesObserver([...this.openedFiles!]);
      return;
    }
  }
}
