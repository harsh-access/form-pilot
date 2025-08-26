import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output
} from '@angular/core';
import {
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

@Component({
  selector: 'rx-slider',
  templateUrl: './rx_slider_control.component.html',
  styleUrls: ['./rx_slider_control.component.css'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RxSliderControlComponent),
      multi: true
    }
  ]
})
export class RxSliderControlComponent implements OnInit, ControlValueAccessor {
  @Input() value: number = null;
  @Input() floor: number = 1;
  @Input() ceil: number = 10;
  @Input() step: number = 1;
  @Input() showComponent: boolean = true;
  @Input() disabled: boolean = false;

  @Output() valueChange = new EventEmitter<number>();

  sliderForm: FormGroup;
  sliderValue: number = null;
  isActive: boolean = false;

  constructor(private fb: FormBuilder) {
    this.sliderForm = this.fb.group({
      value: [this.value]
    });
  }

  ngOnInit(): void {
    if(this.value !== null && this.value !== undefined){
      this.isActive = true;
    }
    this.sliderForm.get('value')?.setValue(this.value);
    this.sliderForm.get('value')?.valueChanges.subscribe(val => {
      this.value = val;
      this.onChange(val);
      if(this.isActive){
        this.sliderValue = this.value;
      }
      this.valueChange.emit(this.sliderValue);
    });
  }

  // ControlValueAccessor methods
  writeValue(val: any): void {
    this.value = val;
    this.sliderForm.get('value')?.setValue(val, { emitEvent: false });
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    if (isDisabled) {
      this.sliderForm.disable();
    } else {
      this.sliderForm.enable();
    }
  }

  activateSlider(event: MouseEvent) {
    const container = event.currentTarget as HTMLElement;
    const trackWidth = container.clientWidth;
    const clickX = event.offsetX;
    const percent = clickX / trackWidth;
 
    const newValue = Math.round(
      this.floor + (this.ceil - this.floor) * percent
    );
 
    this.isActive = true;
    this.sliderValue = newValue;

    if(this.value === newValue){
      this.valueChange.emit(this.sliderValue);
    }
    this.value = newValue;
  }

  private onChange: any = () => {};
  private onTouched: any = () => {};
}
