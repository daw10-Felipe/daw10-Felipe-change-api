import { Component, OnInit, signal, computed } from '@angular/core';
import { PetitionService } from '../../services/petition.service';
import { Petition } from '../../models/petition.model';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';

import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [FormsModule, RouterLink, CommonModule],
    templateUrl: './home.html',
    styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
    petitions = signal<Petition[]>([]);
    searchTerm = signal('');

    filteredPetitions = computed(() => {
        const term = this.searchTerm().toLowerCase();
        return this.petitions().filter(p =>
            p.title.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term)
        );
    });

    constructor(
        private petitionService: PetitionService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            this.petitionService.getPetitions().subscribe(petitions => {
                let filtered = petitions;
                if (params['user']) {
                    const userId = +params['user'];
                    filtered = petitions.filter(p => p.user_id === userId);
                }
                this.petitions.set(filtered);
            });
        });
    }
}
