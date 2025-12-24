import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

  constructor() { }

  success(title: string, text: string = '') {
    return Swal.fire({
      icon: 'success',
      title: title,
      text: text,
      confirmButtonText: 'ตกลง',
      confirmButtonColor: '#198754' 
    });
  }

  
  error(title: string, text: string = '') {
    return Swal.fire({
      icon: 'error',
      title: title,
      text: text,
      confirmButtonText: 'ปิด',
      confirmButtonColor: '#dc3545' 
    });
  }

  
  toastSuccess(title: string) {
    this.Toast.fire({
      icon: 'success',
      title: title
    });
  }

  toastError(title: string) {
    this.Toast.fire({
      icon: 'error',
      title: title
    });
  }

  
  confirm(title: string, text: string): Promise<boolean> {
    return Swal.fire({
      title: title,
      text: text,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'ใช่, ยืนยัน',
      cancelButtonText: 'ยกเลิก'
    }).then((result) => {
      return result.isConfirmed;
    });
  }
}