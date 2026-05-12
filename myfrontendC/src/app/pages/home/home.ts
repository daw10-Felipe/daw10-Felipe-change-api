import { Component, OnInit, signal, computed } from '@angular/core';
import { PetitionService } from '../../services/petition.service';
import { Petition, PETITION_CATEGORIES } from '../../models/petition.model';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
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
    categories = signal<string[]>([]);

    currentPage = signal(1);
    pageSize = signal(6);

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

    totalPages = computed(() => Math.max(1, Math.ceil(this.filteredPetitions().length / this.pageSize())));

    paginatedPetitions = computed(() => {
        const start = (this.currentPage() - 1) * this.pageSize();
        const end = start + this.pageSize();
        return this.filteredPetitions().slice(start, end);
    });

    constructor(
        private petitionService: PetitionService,
        private route: ActivatedRoute,
        private router: Router,
        public auth: AuthService
    ) { }

    ngOnInit() {
        this.petitionService.getCategories().subscribe(cats => {
            this.categories.set(cats.map(c => c.name));
        });

        this.route.queryParams.subscribe(params => {
            if (params['user'] && !this.auth.isAuthenticated()) {
                this.router.navigate(['/login']);
                return;
            }

            this.petitionService.getPetitions().subscribe(petitions => {
                let filtered = petitions;
                if (params['user']) {
                    const userId = +params['user'];
                    filtered = petitions.filter(p => p.user_id === userId);
                }
                this.petitions.set(filtered.map(p => ({ ...p, _carouselIndex: 0 })));
                this.currentPage.set(1);
            });
        });
    }

    onFilterChange() {
        this.currentPage.set(1);
    }

    changePage(page: number) {
        if (page >= 1 && page <= this.totalPages()) {
            this.currentPage.set(page);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
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
