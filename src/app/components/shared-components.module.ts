import { NgModule } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { MonacoEditorComponent } from './monaco-editor-component/monaco-editor.component';
import { SidePanelComponent } from './side-panel/side-panel.component';
import { ResizableModule } from 'angular-resizable-element';
import { SideNavComponent } from './side-nav/side-nav.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InteractiveListComponent } from './interactive-list/interactive-list.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DialogComponent } from './dialog/dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { OpenedFilesComponent } from './opened-files/opened-files.component';
import { NgScrollbarModule } from 'ngx-scrollbar';

@NgModule({
  declarations: [
    HeaderComponent,
    MonacoEditorComponent,
    SidePanelComponent,
    SideNavComponent,
    InteractiveListComponent,
    DialogComponent,
    OpenedFilesComponent
  ],
  exports: [
    HeaderComponent,
    MonacoEditorComponent,
    SidePanelComponent,
    SideNavComponent,
    InteractiveListComponent,
    DialogComponent
  ],
  imports: [
    ResizableModule,
    MatTooltipModule,
    DragDropModule,
    CommonModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    NgScrollbarModule.withConfig({
      track: 'horizontal',
      visibility: 'hover',
      minThumbSize: 3
    })
  ],
  providers: [],
  bootstrap: []
})

export class SharedComponentsModule { }
