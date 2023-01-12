import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { ChecklistDatabase, TodoItemFlatNode, TodoItemNode } from './checklist-database';
import { iconList } from './file-type-enum';

@Component({
  selector: 'app-interactive-list',
  templateUrl: './interactive-list.component.html',
  styleUrls: ['./interactive-list.component.scss'],
  providers: [ChecklistDatabase]
})
export class InteractiveListComponent {
  /** Map from flat node to nested node. This helps us finding the nested node to be modified */
  flatNodeMap = new Map<TodoItemFlatNode, TodoItemNode>();

  /** Map from nested node to flattened node. This helps us to keep the same object for selection */
  nestedNodeMap = new Map<TodoItemNode, TodoItemFlatNode>();

  /** A selected parent node to be inserted */
  selectedParent: TodoItemFlatNode | null = null;

  /** The new item's name */
  newItemName = '';

  treeControl: FlatTreeControl<TodoItemFlatNode>;

  treeFlattener: MatTreeFlattener<TodoItemNode, TodoItemFlatNode>;

  dataSource: MatTreeFlatDataSource<TodoItemNode, TodoItemFlatNode>;

  /** The selection for checklist */
  checklistSelection = new SelectionModel<TodoItemFlatNode>(true /* multiple */);

  /* Drag and drop */
  dragNode: any;
  dragNodeExpandOverWaitTimeMs = 300;
  dragNodeExpandOverNode: any;
  dragNodeExpandOverTime: number = 0;
  dragNodeExpandOverArea: string = '';
  @ViewChild('emptyItem') emptyItem!: ElementRef;

  constructor(private database: ChecklistDatabase) {
    this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel, this.isExpandable, this.getChildren);
    this.treeControl = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
    this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

    database.dataChange.subscribe(data => {
      this.dataSource.data = [];
      this.dataSource.data = data;
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

  getLevel = (node: TodoItemFlatNode) => node.level;

  isExpandable = (node: TodoItemFlatNode) => node.expandable;

  getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

  isDirectory = (_: number, _nodeData: TodoItemFlatNode) => !_nodeData.isFile;

  hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.name === '';

  /**
   * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
   */
  transformer = (node: TodoItemNode, level: number) => {
    const existingNode = this.nestedNodeMap.get(node);
    const flatNode = existingNode && existingNode.name === node.name
      ? existingNode
      : new TodoItemFlatNode();
    flatNode.name = node.name;
    flatNode.level = level;
    flatNode.expandable = (node.children && node.children.length > 0);
    flatNode.isFile = node.isFile;
    this.flatNodeMap.set(flatNode, node);
    this.nestedNodeMap.set(node, flatNode);
    return flatNode;
  }

  /** Whether all the descendants of the node are selected */
  descendantsAllSelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    return descendants.every(child => this.checklistSelection.isSelected(child));
  }

  /** Whether part of the descendants are selected */
  descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
    const descendants = this.treeControl.getDescendants(node);
    const result = descendants.some(child => this.checklistSelection.isSelected(child));
    return result && !this.descendantsAllSelected(node);
  }

  /** Toggle the to-do item selection. Select/deselect all the descendants node */
  todoItemSelectionToggle(node: TodoItemFlatNode): void {
    this.checklistSelection.toggle(node);
    const descendants = this.treeControl.getDescendants(node);
    this.checklistSelection.isSelected(node)
      ? this.checklistSelection.select(...descendants)
      : this.checklistSelection.deselect(...descendants);
  }

  /** Select the category so we can insert the new item. */
  addNewItem(node: TodoItemFlatNode) {
    const parentNode = this.flatNodeMap.get(node);
    this.database.insertItem(parentNode!, '');
    this.treeControl.expand(node);
  }

  /** Save the node to database */
  saveNode(node: TodoItemFlatNode, itemValue: string) {
    const nestedNode = this.flatNodeMap.get(node);
    this.database.updateItem(nestedNode!, itemValue);
  }

  handleDragStart(event: any, node: any) {
    // Required by Firefox (https://stackoverflow.com/questions/19055264/why-doesnt-html5-drag-and-drop-work-in-firefox)
    // event.dataTransfer.setData('foo', 'bar');
    // event.dataTransfer.setDragImage(this.emptyItem.nativeElement, 0, 0);
    this.dragNode = node;
    this.treeControl.collapse(node);
  }

  handleDragOver(event: any, node: any) {
    event.preventDefault();

    // Handle node expand
    if (node === this.dragNodeExpandOverNode) {
      if (this.dragNode !== node && !this.treeControl.isExpanded(node)) {
        if ((new Date().getTime() - this.dragNodeExpandOverTime) > this.dragNodeExpandOverWaitTimeMs) {
          this.treeControl.expand(node);
        }
      }
    } else {
      this.dragNodeExpandOverNode = node;
      this.dragNodeExpandOverTime = new Date().getTime();
    }

    // Handle drag area
    // const percentageY = event.offsetY / event.target.clientHeight;
    // if (percentageY < 0.25) {
    //   this.dragNodeExpandOverArea = 'above';
    // } else if (percentageY > 0.75) {
    //   this.dragNodeExpandOverArea = 'below';
    // } else {
    //   this.dragNodeExpandOverArea = 'center';
    // }
  }

  handleDrop(event: any, node: any) {
    event.preventDefault();

    if (node.isFile) {
      return
    }

    if (node !== this.dragNode) {
      let newItem: TodoItemNode | undefined;
      // if (this.dragNodeExpandOverArea === 'above') {
      //   newItem = this.database.copyPasteItemAbove(this.flatNodeMap.get(this.dragNode)!, this.flatNodeMap.get(node)!);
      // } else if (this.dragNodeExpandOverArea === 'below') {
      //   newItem = this.database.copyPasteItemBelow(this.flatNodeMap.get(this.dragNode)!, this.flatNodeMap.get(node)!);
      // } else {
      newItem = this.database.copyPasteItem(this.flatNodeMap.get(this.dragNode)!, this.flatNodeMap.get(node)!);
      if (!newItem) {
        return;
      }
      // }
      newItem.isFile = this.dragNode.isFile;
      console.log(this.dragNode, newItem);

      this.database.deleteItem(this.flatNodeMap.get(this.dragNode)!);
      this.treeControl.expandDescendants(this.nestedNodeMap.get(newItem)!);
    }

    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
  }

  handleDragEnd(event: any) {
    this.dragNode = null;
    this.dragNodeExpandOverNode = null;
    this.dragNodeExpandOverTime = 0;
  }

  openContextMenu(event: any, node: TodoItemFlatNode) {
    event.preventDefault();
    console.log(node);
  }
}