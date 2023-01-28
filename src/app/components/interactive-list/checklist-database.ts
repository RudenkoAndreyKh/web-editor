import { BehaviorSubject } from 'rxjs';
import { Injectable, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import * as uuid from 'uuid';

/**
 * Node for to-do item
 */
export class TodoItemNode {
    children: TodoItemNode[] = [];
    name: string = '';
    isFile: boolean = false;
    parentName: string | null = null;
    isDefocused?: boolean;
    id!: string;
    isChangingName?: boolean;
    isOpenedNew?: boolean | null;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
    name: string = '';
    level: number = 0;
    expandable: boolean = false;
    isFile: boolean = false;
    isDefocused?: boolean;
    id!: string;
    isChangingName?: boolean;
}

/**
* The Json object for to-do list data.
*/
const dirTree = {
    treeContainer: {
        children: {
            'console.js': {
                type: 'file',
                state: null,
            },
            groceries: {
                children: {
                    'console.js': {
                        type: 'file',
                        state: null,
                    },
                    'Organiceggs.ts': {
                        type: 'file',
                        state: null,
                    },
                    'Protein Powder.jsx': {
                        type: 'file',
                        state: null,
                    },
                    'geg': {
                        type: 'directory',
                        state: null,
                    },
                    'Fruits': {
                        children: {
                            Apple: {
                                type: 'file',
                                state: null,
                            },
                            Berries: {
                                children: {
                                    'Blueberry.js': {
                                        type: 'file',
                                        state: null,
                                    },
                                    'Raspberry.ts': {
                                        type: 'file',
                                        state: null,
                                    },
                                },
                                type: 'directory',
                                state: null
                            },
                            Orange: {
                                type: 'file',
                                state: null,
                            },
                        },
                        type: 'directory',
                        state: null,
                    },
                    Reminders: {
                        children: {
                            'Cook dinner': {
                                type: 'file',
                                state: null,
                            },
                            'Read the Material Design spec': {
                                type: 'file',
                                state: null,
                            },
                            'Upgrade Application to Angular': {
                                type: 'file',
                                state: null,
                            }
                        },
                        type: 'directory',
                        state: null
                    }
                },
                type: 'directory',
                state: null
            }
        },
        type: 'directory'
    },
};

/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class ChecklistDatabase {
    dataChange = new BehaviorSubject<TodoItemNode[]>([]);

    get data(): TodoItemNode[] { return this.dataChange.value; }

    constructor(public dialog: MatDialog) {
        this.initialize();
    }

    initialize() {
        // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
        //     file node as children.
        let data = this.buildFileTree(dirTree, 0, null);

        // Notify the change.
        this.dataChange.next(data);
    }

    /**
     * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
     * The return value is the list of `TodoItemNode`.
     */
    buildFileTree(obj: any, level: number, parentName: string | null): TodoItemNode[] {
        return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
            const value = obj[key];
            const node = new TodoItemNode();
            node.name = key;
            node.isFile = obj[key].type === 'file' || false;
            node.parentName = parentName;
            node.id = uuid.v4();

            if (typeof value === 'object' && value.children) {
                node.children = this.buildFileTree(value.children, level + 1, level + 1 > 0 ? key : null);
            }

            return accumulator.concat(node);
        }, []);
    }

    openDialog(message: string, ok: string, cancel: string): Promise<boolean> {
        const dialogRef = this.dialog.open(DialogComponent, {
            data: {
                message,
                buttonText: {
                    ok,
                    cancel
                }
            }
        });

        return new Promise((res, rej) => {
            dialogRef.afterClosed().subscribe((confirmed: boolean) => {
                return res(confirmed);
            });
        });
    }

    /** Add an item to to-do list */
    async insertItem(parent: TodoItemNode, newNode: TodoItemNode, isCreating: boolean, isChildren?: boolean): Promise<TodoItemNode | undefined> {

        if (!parent.children) {
            parent.children = [];
        }

        if (!isChildren && !isCreating) {
            const isMoving = await this.openDialog(`Do you want to move ${newNode.name} into ${parent.name}?`, 'Move', 'Cancel');

            if (!isMoving) {
                return;
            }

            const isExistingName = parent.children.find(child => child?.name === newNode?.name);
            let isReplace = true;

            if (isExistingName) {
                isReplace = await this.openDialog(`A file or folder with the name ${newNode.name} already exists in the destination folder. Do you want to replace it?`, 'Replace', 'Cancel');
            }

            if (!isReplace) {
                return;
            }

            if (parent.children) {
                // removing replacable item
                const childIndexToDelete = parent.children.findIndex(child => child?.name === newNode?.name);

                delete parent.children[childIndexToDelete]
            }
            // removing new item from prev parent
            const prevParent = this.getParentFromNodes(newNode);
            const childIndexToDelete = prevParent?.children.findIndex(child => child?.name === newNode?.name);
            delete prevParent?.children[childIndexToDelete!]
        }

        const parentName = parent.name;
        const { name, id, isFile, isDefocused, isChangingName } = newNode;
        const newItem = { name, id, isFile, isDefocused, parentName, isChangingName } as TodoItemNode;

        if (!newItem.id) {
            newItem.id = uuid.v4();
        }

        parent.children.push(newItem);
        parent.children = parent.children.sort((a, b) => {
            const isDirVsFile: number = Number(a.isFile) - Number(b.isFile);

            return isDirVsFile ? isDirVsFile : a.name.localeCompare(b.name);
        });

        this.dataChange.next(this.data);
        return newItem;
    }

    async copyPasteItem(from: TodoItemNode, to: TodoItemNode, isChildren?: boolean): Promise<TodoItemNode | undefined> {
        const newItem = await this.insertItem(to, from, false, isChildren);

        if (!newItem) {
            return;
        }
        if (from.children) {
            from.children.forEach(child => {
                this.copyPasteItem(child, newItem, true);
            });
        }
        return new Promise((res, rej) => {
            res(newItem);
        });
    }

    // insertItemAbove(node: TodoItemNode, name: string): TodoItemNode {
    //     const parentNode = this.getParentFromNodes(node);
    //     const newItem = { name } as TodoItemNode;
    //     if (parentNode != null) {
    //         parentNode.children.splice(parentNode.children.indexOf(node), 0, newItem);
    //     } else {
    //         this.data.splice(this.data.indexOf(node), 0, newItem);
    //     }
    //     this.dataChange.next(this.data);
    //     return newItem;
    // }

    // insertItemBelow(node: TodoItemNode, name: string): TodoItemNode {
    //     const parentNode = this.getParentFromNodes(node);
    //     const newItem = { name } as TodoItemNode;
    //     if (parentNode != null) {
    //         parentNode.children.splice(parentNode.children.indexOf(node) + 1, 0, newItem);
    //     } else {
    //         this.data.splice(this.data.indexOf(node) + 1, 0, newItem);
    //     }
    //     this.dataChange.next(this.data);
    //     return newItem;
    // }

    getParentFromNodes(node: TodoItemNode): TodoItemNode | null {
        for (let i = 0; i < this.data.length; ++i) {
            const currentRoot = this.data[i];
            const parent = this.getParent(currentRoot, node);
            if (parent != null) {
                return parent;
            }
        }
        return null;
    }

    getParent(currentRoot: TodoItemNode, node: TodoItemNode): TodoItemNode | null {
        if (currentRoot?.children && currentRoot.children.length > 0) {
            for (let i = 0; i < currentRoot.children.length; ++i) {
                const child = currentRoot.children[i];
                if (child === node) {
                    return currentRoot;
                } else if (child?.children && child.children.length > 0) {
                    const parent = this.getParent(child, node);
                    if (parent != null) {
                        return parent;
                    }
                }
            }
        }
        return null;
    }

    updateItem(node: any, changedNode: any, isNewNode?: boolean) {
        Object.keys(changedNode).forEach(key => node[key] = changedNode[key]);
        if (isNewNode) {
            const parent = this.getParentFromNodes(node);
            parent!.children = parent!.children.sort((a, b) => {
                const isDirVsFile = Number(a.isFile) - Number(b.isFile);

                return isDirVsFile ? isDirVsFile : a.name.localeCompare(b.name);
            });
        }
        
        this.dataChange.next(this.data);
    }

    deleteItem(node: TodoItemNode) {
        this.deleteNode(this.data, node);
        this.dataChange.next(this.data);
    }

    // copyPasteItemAbove(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
    //     const newItem = this.insertItemAbove(to, from.name);
    //     if (from.children) {
    //         from.children.forEach(child => {
    //             this.copyPasteItem(child, newItem);
    //         });
    //     }
    //     return newItem;
    // }

    // copyPasteItemBelow(from: TodoItemNode, to: TodoItemNode): TodoItemNode {
    //     const newItem = this.insertItemBelow(to, from.name);
    //     if (from.children) {
    //         from.children.forEach(child => {
    //             this.copyPasteItem(child, newItem);
    //         });
    //     }
    //     return newItem;
    // }

    deleteNode(nodes: TodoItemNode[], nodeToDelete: TodoItemNode) {
        const index = nodes.indexOf(nodeToDelete, 0);
        if (index > -1) {
            nodes.splice(index, 1);
        } else {
            nodes.forEach(node => {
                if (node.children && node.children.length > 0) {
                    this.deleteNode(node.children, nodeToDelete);
                }
            });
        }
    }
}