import { Component, OnInit, signal, computed } from '@angular/core';
import { PetitionService } from '../../services/petition.service';
import { Petition } from '../../models/petition.model';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-mis-firmas',
  imports: [CommonModule, RouterLink],
  templateUrl: './mis-firmas.html',
  styleUrl: './mis-firmas.css',
  standalone: true
})
export class MisFirmasComponent implements OnInit {
  petitions = signal<(Petition & { _carouselIndex?: number })[]>([]);

  constructor(
    private petitionService: PetitionService,
    public auth: AuthService
  ) { }

  ngOnInit() {
    this.petitionService.getSignedPetitions().subscribe(petitions => {
      this.petitions.set(petitions.map(p => ({ ...p, _carouselIndex: 0 })));
    });
  }

  prevImage(petition: Petition & { _carouselIndex?: number }, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (!petition.images) return;
    const len = petition.images.length;
    petition._carouselIndex = ((petition._carouselIndex || 0) - 1 + len) % len;
  }

  nextImage(petition: Petition & { _carouselIndex?: number }, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    if (!petition.images) return;
    const len = petition.images.length;
    petition._carouselIndex = ((petition._carouselIndex || 0) + 1) % len;
  }

  goToImage(petition: Petition & { _carouselIndex?: number }, index: number, event: Event) {
    event.preventDefault();
    event.stopPropagation();
    petition._carouselIndex = index;
  }
}
