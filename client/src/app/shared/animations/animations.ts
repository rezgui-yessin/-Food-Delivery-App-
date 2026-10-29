import { animate, query, stagger, style, transition, trigger, keyframes } from '@angular/animations';

export const fadeAnimation = trigger('fadeAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'translateY(6px)' }),
    animate('250ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-6px)' }))
  ])
]);

export const slideOverAnimation = trigger('slideOverAnimation', [
  transition(':enter', [
    style({ transform: 'translateX(100%)' }),
    animate('300ms cubic-bezier(0.16, 1, 0.3, 1)', style({ transform: 'translateX(0%)' }))
  ]),
  transition(':leave', [
    animate('250ms ease-in', style({ transform: 'translateX(100%)' }))
  ])
]);

export const backdropFadeAnimation = trigger('backdropFadeAnimation', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('200ms ease-out', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ opacity: 0 }))
  ])
]);

export const modalScaleAnimation = trigger('modalScaleAnimation', [
  transition(':enter', [
    style({ opacity: 0, transform: 'scale(0.92)' }),
    animate('250ms cubic-bezier(0.34, 1.56, 0.64, 1)', style({ opacity: 1, transform: 'scale(1)' }))
  ]),
  transition(':leave', [
    animate('150ms ease-in', style({ opacity: 0, transform: 'scale(0.95)' }))
  ])
]);

export const staggerListAnimation = trigger('staggerListAnimation', [
  transition('* => *', [
    query(':enter', [
      style({ opacity: 0, transform: 'translateY(15px)' }),
      stagger('50ms', [
        animate('300ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ], { optional: true })
  ])
]);

export const pulseGlowAnimation = trigger('pulseGlowAnimation', [
  transition('* => *', [
    animate('2s infinite ease-in-out', keyframes([
      style({ transform: 'scale(0.98)', opacity: 0.7, offset: 0 }),
      style({ transform: 'scale(1.05)', opacity: 1, offset: 0.5 }),
      style({ transform: 'scale(0.98)', opacity: 0.7, offset: 1.0 })
    ]))
  ])
]);

export const slideInRightAnimation = trigger('slideInRight', [
  transition(':enter', [
    style({ transform: 'translateX(100%)', opacity: 0 }),
    animate('300ms cubic-bezier(0.16, 1, 0.3, 1)', style({ transform: 'translateX(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ transform: 'translateX(100%)', opacity: 0 }))
  ])
]);

