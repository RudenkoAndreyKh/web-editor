import { Component } from '@angular/core';
import { MAT_TOOLTIP_DEFAULT_OPTIONS, MatTooltipDefaultOptions } from '@angular/material/tooltip';

export const tooltipDefaultOptions: MatTooltipDefaultOptions = {
  showDelay: 1000,
  hideDelay: 0,
  touchendHideDelay: 0,
  position: 'right'
};

@Component({
  selector: 'app-side-nav',
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
  providers: [{ provide: MAT_TOOLTIP_DEFAULT_OPTIONS, useValue: tooltipDefaultOptions }]
})

export class SideNavComponent {
  public explorerTooltip: string = 'Explorer';
}
