import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'formatText',
  standalone: true
})
export class FormatTextPipe implements PipeTransform {
  transform(value: string | undefined | null): string {
    if (!value) return '';
    
    // Replace **text** or *text* with <strong class="font-bold">text</strong>
    let formatted = value.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
    formatted = formatted.replace(/\*(.*?)\*/g, '<strong class="font-bold">$1</strong>');
    
    return formatted;
  }
}
