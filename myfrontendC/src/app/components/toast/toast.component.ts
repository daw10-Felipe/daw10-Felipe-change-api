import { Component, inject } from '@angular/core';
import { ToastService, Toast } from '../../services/toast.service';
import { CommonModule } from '@angular/common'; 



@Component({
    selector: 'app-toast',
    standalone: true,
    imports: [],
    template: `
    <div class="toast-container">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class.error]="toast.type === 'error'" [class.success]="toast.type === 'success'" [class.info]="toast.type === 'info'">
          <span>{{ toast.message }}</span>
          <button (click)="toastService.remove(toast.id)">×</button>
        </div>
      }
    </div>
  `,
    styles: [`
    .toast-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .toast {
      padding: 1rem 1.5rem;
      border-radius: 4px;
      background: white;
      color: #333;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      min-width: 250px;
      animation: slideIn 0.3s ease-out;
    }
    .toast.error {
      background-color: #ffebee;
      color: #b71c1c;
      border-left: 4px solid #b71c1c;
    }
    .toast.success {
      background-color: #e8f5e9;
      color: #1b5e20;
      border-left: 4px solid #1b5e20;
    }
    .toast.info {
      background-color: #e3f2fd;
      color: #0d47a1;
      border-left: 4px solid #0d47a1;
    }
    button {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      margin-left: auto;
      color: inherit;
    }
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `]
})
export class ToastComponent {
    toastService = inject(ToastService);
}
