import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { EditorPageComponent } from './pages/editor/editor-page.component';
import { SharedComponentsModule } from './components/shared-components.module';
import { SidePanelObserver } from './services/side-panel-observable.service';
import { OverlayModule } from '@angular/cdk/overlay';

@NgModule({
  declarations: [
    AppComponent,
    EditorPageComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    SharedComponentsModule,
    OverlayModule
  ],
  providers: [
    SidePanelObserver
  ],
  bootstrap: [
    AppComponent
  ]
})

export class AppModule { }
