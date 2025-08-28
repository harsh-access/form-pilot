import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Section } from '../../services/simplified-form.service';

@Component({
  selector: 'app-stage-navigation',
  templateUrl: './stage-navigation.component.html',
  styleUrls: ['./stage-navigation.component.css']
})
export class StageNavigationComponent {
  @Input() sections: Section[] = [];
  @Input() activeSectionId: number = 0;
  @Output() sectionSelected = new EventEmitter<Section>();

  onSectionClick(section: Section): void {
    this.sectionSelected.emit(section);
  }
}
