import { Component, OnInit, signal, computed } from '@angular/core';
import { PetitionService } from '../../services/petition.service';
import { Petition, PETITION_CATEGORIES } from '../../models/petition.model';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [FormsModule, RouterLink, CommonModule],
    templateUrl: './home.html',
    styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
    petitions = signal<(Petition & { _carouselIndex?: number })[]>([]);
    searchTerm = signal('');
    signedFilter = signal<'all' | 'signed' | 'unsigned'>('all');
    categoryFilter = signal<string>('');
    categories = PETITION_CATEGORIES;

    filteredPetitions = computed(() => {
        const term = this.searchTerm().toLowerCase();
        const signed = this.signedFilter();
        const category = this.categoryFilter();

        return this.petitions().filter(p => {
            const matchesSearch = p.title.toLowerCase().includes(term) ||
                p.description.toLowerCase().includes(term);

            const matchesSigned = signed === 'all' ||
                (signed === 'signed' && p.has_signed) ||
                (signed === 'unsigned' && !p.has_signed);

            const matchesCategory = !category || p.category === category;

            return matchesSearch && matchesSigned && matchesCategory;
        });
    });

    constructor(
        private petitionService: PetitionService,
        private route: ActivatedRoute,
        public auth: AuthService
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.petitionService.getPetitions().subscribe(petitions => {
                let filtered = petitions;
                if (params['user']) {
                    const userId = +params['user'];
                    filtered = petitions.filter(p => p.user_id === userId);
                }
                this.petitions.set(filtered.map(p => ({ ...p, _carouselIndex: 0 })));
            });
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
